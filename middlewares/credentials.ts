import allowedOrigins from "../config/allowedOrigins";
import {NextFunction, Request, Response} from "express";

const credentials = (req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers.origin;
    if (allowedOrigins.includes(<string>origin)) {
        res.header('Access-Control-Allow-Credentials', 'true');
    }
    next();
}

export default credentials