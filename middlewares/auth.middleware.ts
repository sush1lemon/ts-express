import {NextFunction, Request, Response} from "express";
import jwt, {JwtPayload} from "jsonwebtoken";

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization as string || req.headers.Authorization as string;
    if (!authHeader?.startsWith('Bearer ')) return res.sendStatus(401);
    const token = authHeader.split(' ')[1];
    jwt.verify(token,
        process.env.ACCESS_TOKEN_SECRET || "notsosecret", (err, decoded) => {
            if (err) return res.sendStatus(403); //invalid token
            decoded = decoded as JwtPayload
            req.user = decoded?.userInfo
            next();
        })
}

export default authMiddleware