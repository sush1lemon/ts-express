"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const user_controller_1 = __importDefault(require("../controllers/user.controller"));
const auth_middleware_1 = __importDefault(require("../middlewares/auth.middleware"));
const controller = new user_controller_1.default();
/* GET users listing. */
router.post('/', controller.GetUser);
router.post('/login', controller.Login);
router.get('/refresh', controller.VerifyRefreshToken);
router.get('/todos', auth_middleware_1.default, controller.GetUserTodos);
router.get('/logout', controller.Logout);
router.post('/sign-up', controller.SignUp);
const userRouter = router;
module.exports = userRouter;
