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
const todo_model_1 = __importDefault(require("../models/todo.model"));
const mongoose_1 = require("mongoose");
const user_model_1 = __importDefault(require("../models/user.model"));
class TodoController {
    constructor() {
        this.NewTodo = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const todo = req.body;
            const user = yield user_model_1.default.findById(mongoose_1.Types.ObjectId.createFromHexString(req.user.id)).exec();
            todo._id = new mongoose_1.Types.ObjectId();
            todo.user_id = user === null || user === void 0 ? void 0 : user._id;
            const created = yield todo_model_1.default.create(todo);
            return res.json(created);
        });
        this.GetTodo = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            if ((0, mongoose_1.isValidObjectId)(id)) {
                const todo = yield todo_model_1.default.findById(mongoose_1.Types.ObjectId.createFromHexString(id)).exec();
                return res.json(todo);
            }
            return res.json(null);
        });
        this.UpdateTodo = (req, res) => __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const data = req.body;
            if ((0, mongoose_1.isValidObjectId)(id)) {
                const user = yield user_model_1.default.findById(mongoose_1.Types.ObjectId.createFromHexString(req.user.id)).exec();
                data.user_id = user === null || user === void 0 ? void 0 : user._id;
                const todo = yield todo_model_1.default.findOneAndUpdate({ _id: mongoose_1.Types.ObjectId.createFromHexString(id) }, data).exec();
                return res.json(todo);
            }
            return res.json(null);
        });
        this.DeleteTodo = (req, res) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { id } = req.params;
            if ((0, mongoose_1.isValidObjectId)(id)) {
                const user = yield user_model_1.default.findById(mongoose_1.Types.ObjectId.createFromHexString(req.user.id)).exec();
                const todo = yield todo_model_1.default.findById(mongoose_1.Types.ObjectId.createFromHexString(id)).exec();
                if ((user === null || user === void 0 ? void 0 : user._id.toString()) == ((_a = todo === null || todo === void 0 ? void 0 : todo.user_id) === null || _a === void 0 ? void 0 : _a.toString())) {
                    yield (todo === null || todo === void 0 ? void 0 : todo.delete());
                    return res.json({ deleted: true });
                }
            }
            return res.json(null);
        });
    }
}
exports.default = TodoController;
