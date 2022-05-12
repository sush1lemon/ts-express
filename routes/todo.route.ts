import express, {Response} from "express";
import TodoController from "../controllers/todo.controller";
const router = express.Router();
const controller = new TodoController()

router.post('/', controller.NewTodo)
router.get('/:id', controller.GetTodo)
router.put('/:id', controller.UpdateTodo)
router.delete('/:id', controller.DeleteTodo)

const todoRouter = router;
export = todoRouter