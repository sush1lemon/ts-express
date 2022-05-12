import express from "express";
import userRouter from "./user.route";
import todoRouter from "./todo.route";
const router = express.Router();

router.use('/user', userRouter)
router.use('/todo', todoRouter)

export default router