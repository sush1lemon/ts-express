import jwt, {JsonWebTokenError, JwtPayload, NotBeforeError, TokenExpiredError} from 'jsonwebtoken';
import {Request, Response} from "express";
import UserModel, {IUser, UserRefreshToken} from "../models/user.model";
import useragent from 'express-useragent';
import bcrypt from 'bcrypt';
import {isValidObjectId, Schema, Types} from "mongoose";
import TodoModel from "../models/todo.model";


interface LoginRequest {
    username: string,
    password: string,
}

class UserController {

    public Login = async (req: Request<{}, {}, LoginRequest>, res: Response) => {
        const {username, password} = req.body;

        if (!username || !password) return res.status(400).json({'message': 'Username and password are required.'});

        const user = await UserModel.findOne({username: username}).exec()
        if (!user) return res.status(401).json({'message': 'Invalid username or password'});
        const check = await bcrypt.compare(password, user?.password)
        if (!check) {
            return res.status(401).json({'message': 'Invalid username or password'});
        }

        const accessToken = this.SignAccessToken(user.username)

        const refreshToken = jwt.sign(
            {"username": user.username},
            process.env.REFRESH_TOKEN_SECRET ?? 'notsosecret',
            {expiresIn: '1d'}
        );

        const ip = req.headers['x-forwarded-for'] as string ||
            req.socket.remoteAddress ||
            "Unknown";

        const device = `${req.useragent?.os} ${req.useragent?.browser} ${req.useragent?.geoIp}`

        const rfToken: UserRefreshToken = {
            device: device,
            ip: ip,
            token: refreshToken
        };

        user.refreshToken?.push(rfToken)
        await user.save();

        // res.cookie('jwt', refreshToken, {
        //     httpOnly: true,
        //     maxAge: 24 * 60 * 60 * 1000,
        //     sameSite: "none",
        //     secure: true,
        // })

        res.setHeader('set-cookie', [
            `jwt=${refreshToken}; SameSite=None; HttpOnly; Secure; Max-Age=${24 * 60 * 60 * 1000}`
        ])

        const { firstName, lastName } = user;
        res.json({access_token: accessToken, first_name: firstName, last_name: lastName})
    }

    public Logout = async (req: Request, res: Response) => {
        const cookies = req.cookies;
        if (!cookies?.jwt) return res.sendStatus(204); //No content
        const refreshToken = cookies.jwt;
        const user = await UserModel.findOne({refreshToken: {$elemMatch: { token: refreshToken}}}).exec()
        if (!user) {
            res.clearCookie('jwt', { httpOnly: true, secure: true });
            return res.sendStatus(204);
        }

        user.refreshToken?.filter(({token}) => token != refreshToken)
        const refreshed = await user.save();
        res.clearCookie('jwt', { httpOnly: true,  secure: true });
        return res.sendStatus(204);
    }

    public GetUser = async (req: Request, res: Response) => {
        const id = req.body.id;
        if (isValidObjectId(id)){
            const user = await UserModel.findById(id).exec()
            return res.json(user)
        }

        return res.json({data: null})
    }

    public GetUserTodos = async (req: Request, res: Response) => {
        const user = await this.GetUserViaToken(req, res)
        if (!user) return res.sendStatus(403); //Forbidden

        const todos = await TodoModel.find({user_id: user._id}).exec()
        return res.json(todos)
    }

    public VerifyRefreshToken = async (req: Request, res: Response) => {
        const cookies = req.cookies;
        if (!cookies?.jwt) return res.sendStatus(401);
        const refreshToken = cookies.jwt;
        const user = await UserModel.findOne({refreshToken: {$elemMatch: { token: refreshToken}}}).exec()
        if (!user) return res.sendStatus(403); //Forbidden

        jwt.verify(refreshToken,
            process.env.REFRESH_TOKEN_SECRET ?? 'notsosecret',
            (err: any, decoded: any) => {
                if (err || decoded.username != user.username) return res.sendStatus(403);
                const accessToken = this.SignAccessToken(user.username)
                const { firstName, lastName } = user;
                res.json({access_token: accessToken, first_name: firstName, last_name: lastName})
            })
    }

    public GetUserViaToken = async (req: Request, res:Response) : Promise<IUser | null> => {
        const cookies = req.cookies;
        if (!cookies?.jwt) return null;
        const refreshToken = cookies.jwt;
        const user = await UserModel.findOne({refreshToken: {$elemMatch: { token: refreshToken}}}).exec()
        if (!user) return null; //Forbidden
        return user;
    }

    private SignAccessToken = (username: string) => {
        return jwt.sign(
            {
                "UserInfo": {
                    "username": username,
                }
            },
            process.env.ACCESS_TOKEN_SECRET ?? 'notsosecret',
            {expiresIn: '15m'}
        );
    }
}

export default UserController