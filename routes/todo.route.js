"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_1 = __importDefault(require("express"));
const todo_controller_1 = __importDefault(require("../controllers/todo.controller"));
const auth_middleware_1 = __importDefault(require("../middlewares/auth.middleware"));
const router = express_1.default.Router();
const controller = new todo_controller_1.default();
router.use(auth_middleware_1.default);
router.post('/', controller.NewTodo);
router.get('/:id', controller.GetTodo);
router.put('/:id', controller.UpdateTodo);
router.delete('/:id', controller.DeleteTodo);
const todoRouter = router;
module.exports = todoRouter;
