"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = __importDefault(require("../models/user.model"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const mongoose_1 = require("mongoose");
const todo_model_1 = __importDefault(require("../models/todo.model"));
class UserController {
    constructor() {
        this.Login = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e;
            const { username, password } = req.body;
            if (!username || !password)
                return res.status(400).json({ 'message': 'Username and password are required.' });
            const user = yield user_model_1.default.findOne({ username: username }).exec();
            if (!user)
                return res.status(401).json({ 'message': 'Invalid username or password' });
            const check = yield bcrypt_1.default.compare(password, user === null || user === void 0 ? void 0 : user.password);
            if (!check) {
                return res.status(401).json({ 'message': 'Invalid username or password' });
            }
            const accessToken = this.SignAccessToken(user.username);
            const refreshToken = jsonwebtoken_1.default.sign({ "username": user.username }, (_a = process.env.REFRESH_TOKEN_SECRET) !== null && _a !== void 0 ? _a : 'notsosecret', { expiresIn: '1d' });
            const ip = req.headers['x-forwarded-for'] ||
                req.socket.remoteAddress ||
                "Unknown";
            const device = `${(_b = req.useragent) === null || _b === void 0 ? void 0 : _b.os} ${(_c = req.useragent) === null || _c === void 0 ? void 0 : _c.browser} ${(_d = req.useragent) === null || _d === void 0 ? void 0 : _d.geoIp}`;
            const rfToken = {
                device: device,
                ip: ip,
                token: refreshToken
            };
            (_e = user.refreshToken) === null || _e === void 0 ? void 0 : _e.push(rfToken);
            yield user.save();
            res.cookie('jwt', refreshToken, {
                httpOnly: true,
                secure: true,
                maxAge: 24 * 60 * 60 * 1000,
                sameSite: false
            });
            const { firstName, lastName } = user;
            res.json({ access_token: accessToken, first_name: firstName, last_name: lastName });
        });
        this.Logout = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _f;
            const cookies = req.cookies;
            if (!(cookies === null || cookies === void 0 ? void 0 : cookies.jwt))
                return res.sendStatus(204); //No content
            const refreshToken = cookies.jwt;
            const user = yield user_model_1.default.findOne({ refreshToken: { $elemMatch: { token: refreshToken } } }).exec();
            if (!user) {
                res.clearCookie('jwt', { httpOnly: true, secure: true,
                    sameSite: false, });
                return res.sendStatus(204);
            }
            (_f = user.refreshToken) === null || _f === void 0 ? void 0 : _f.filter(({ token }) => token != refreshToken);
            const refreshed = yield user.save();
            res.clearCookie('jwt', { httpOnly: true, secure: true,
                sameSite: false, });
            return res.sendStatus(204);
        });
        this.GetUser = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const id = req.body.id;
            if ((0, mongoose_1.isValidObjectId)(id)) {
                const user = yield user_model_1.default.findById(id).exec();
                return res.json(user);
            }
            return res.json({ data: null });
        });
        this.GetUserTodos = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const user = yield this.GetUserViaToken(req, res);
            if (!user)
                return res.sendStatus(403); //Forbidden
            const todos = yield todo_model_1.default.find({ user_id: user._id }).exec();
            return res.json(todos);
        });
        this.VerifyRefreshToken = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _g;
            const cookies = req.cookies;
            if (!(cookies === null || cookies === void 0 ? void 0 : cookies.jwt))
                return res.sendStatus(401);
            const refreshToken = cookies.jwt;
            const user = yield user_model_1.default.findOne({ refreshToken: { $elemMatch: { token: refreshToken } } }).exec();
            if (!user)
                return res.sendStatus(403); //Forbidden
            jsonwebtoken_1.default.verify(refreshToken, (_g = process.env.REFRESH_TOKEN_SECRET) !== null && _g !== void 0 ? _g : 'notsosecret', (err, decoded) => {
                if (err || decoded.username != user.username)
                    return res.sendStatus(403);
                const accessToken = this.SignAccessToken(user.username);
                const { firstName, lastName } = user;
                res.json({ access_token: accessToken, first_name: firstName, last_name: lastName });
            });
        });
        this.GetUserViaToken = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const cookies = req.cookies;
            if (!(cookies === null || cookies === void 0 ? void 0 : cookies.jwt))
                return null;
            const refreshToken = cookies.jwt;
            const user = yield user_model_1.default.findOne({ refreshToken: { $elemMatch: { token: refreshToken } } }).exec();
            if (!user)
                return null; //Forbidden
            return user;
        });
        this.SignAccessToken = (username) => {
            var _a;
            return jsonwebtoken_1.default.sign({
                "UserInfo": {
                    "username": username,
                }
            }, (_a = process.env.ACCESS_TOKEN_SECRET) !== null && _a !== void 0 ? _a : 'notsosecret', { expiresIn: '15m' });
        };
    }
}
exports.default = UserController;
