"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const TodoSchema = new mongoose_1.Schema({
    _id: { type: Object, required: false },
    user_id: { type: Object, required: false },
    title: { type: String, required: true },
    content: { type: String, required: true },
    status: { type: Boolean, required: true },
});
const TodoModel = (0, mongoose_1.model)("Todos", TodoSchema);
exports.default = TodoModel;
