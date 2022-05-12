import express, {Response} from "express";
const router = express.Router();
import UserController from '../controllers/user.controller'
const controller = new UserController()

/* GET users listing. */
router.post('/', controller.GetUser)
router.post('/login', controller.Login);
router.get('/refresh', controller.VerifyRefreshToken)
router.get('/todos', controller.GetUserTodos)
router.get('/logout', controller.Logout)
router.post('/sign-up', controller.SignUp)

const userRouter = router;
export = userRouter