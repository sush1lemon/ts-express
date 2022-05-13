import jwt from 'jsonwebtoken';
import {Request, Response} from "express";
import UserModel, {IUser, UserRefreshToken} from "../models/user.model";
import bcrypt from 'bcrypt';
import {isValidObjectId, Types} from "mongoose";
import TodoModel from "../models/todo.model";
import {SignUpUserRequest} from "../types/user";


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

        const accessToken = this.SignAccessToken(user)

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

    public SignUp = async (req: Request<{}, {}, SignUpUserRequest>, res: Response) => {
        const user = req.body
        const check = await UserModel.findOne({username: user.username}).exec()
        if (check) return res.status(401).json({
            message: 'Username is already taken.'
        })

        const created = await UserModel.create({
            _id: new Types.ObjectId(),
            username: user.username,
            password: await bcrypt.hash(user.password, 12),
            firstName: user.firstName,
            lastName: user.lastName
        })

        return res.json(created)
    }

    public Logout = async (req: Request, res: Response) => {
        const cookies = req.cookies;
        if (!cookies?.jwt) return res.sendStatus(204); //No content
        const refreshToken = cookies.jwt;
        const user = await UserModel.findOne({refreshToken: {$elemMatch: { token: refreshToken}}}).exec()
        if (!user) {
            res.setHeader('set-cookie', [
                `jwt=${refreshToken}; SameSite=None; HttpOnly; Secure; Max-Age=0`
            ])
            return res.sendStatus(204);
        }

        user.refreshToken = user.refreshToken?.filter((rf) => rf.token != refreshToken)
        const refreshed = await user.save();
        res.setHeader('set-cookie', [
            `jwt=${refreshToken}; SameSite=None; HttpOnly; Secure; Max-Age=0`
        ])
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

    public GetUsers = async (req: Request, res: Response) => {
        const id = req.user.id;
        const filter = id ? { $not: { _id: id}} : {};
        const users = await UserModel.find(filter).exec()
        return res.json(users);
    }

    public GetUserTodos = async (req: Request, res: Response) => {
        const todos = await TodoModel.find({user_id: Types.ObjectId.createFromHexString(req.user.id)}).exec()
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
                const accessToken = this.SignAccessToken(user)
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

    private SignAccessToken = (user: IUser) => {
        return jwt.sign(
            {
                "UserInfo": {
                    "username": user.username,
                    "id": user._id,
                }
            },
            process.env.ACCESS_TOKEN_SECRET ?? 'notsosecret',
            {expiresIn: '15m'}
        );
    }
}

export default UserController