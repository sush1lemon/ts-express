import {Request, Response} from "express";
import TodoModel, {ITodo} from "../models/todo.model";
import UserController from "./user.controller";
import {isValidObjectId, Schema, Types} from "mongoose";
import UserModel from "../models/user.model";

const userController = new UserController()

class TodoController {

    public NewTodo = async (req: Request<{}, {}, ITodo>, res: Response) => {
        const todo = req.body;
        const user = await UserModel.findById(Types.ObjectId.createFromHexString(req.user.id)).exec()
        todo._id = new Types.ObjectId()
        todo.user_id = user?._id
        const created = await TodoModel.create(todo)
        return res.json(created)
    }

    public GetTodo = async (req: Request, res: Response) => {
        const {id} = req.params
        if (isValidObjectId(id)) {
            const todo = await TodoModel.findById(Types.ObjectId.createFromHexString(id)).exec()
            return res.json(todo);
        }
        return res.json(null);
    }

    public UpdateTodo = async (req: Request, res: Response) => {
        const {id} = req.params
        const data = req.body as ITodo;
        if (isValidObjectId(id)) {
            const user = await UserModel.findById(Types.ObjectId.createFromHexString(req.user.id)).exec()
            data.user_id = user?._id
            const todo = await TodoModel.findOneAndUpdate({_id: Types.ObjectId.createFromHexString(id)}, data).exec()
            return res.json(todo);
        }
        return res.json(null)
    }

    public DeleteTodo = async (req: Request, res: Response) => {
        const {id} = req.params
        if (isValidObjectId(id)) {
            const user = await UserModel.findById(Types.ObjectId.createFromHexString(req.user.id)).exec()
            const todo = await TodoModel.findById(Types.ObjectId.createFromHexString(id)).exec()
            if (user?._id.toString() == todo?.user_id?.toString()) {
                await todo?.delete();
                return res.json({deleted: true})
            }
        }
        return res.json(null)
    }
}

export default TodoController