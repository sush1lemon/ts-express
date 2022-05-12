"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const UserSchema = new mongoose_1.Schema({
    _id: { type: Object, required: true },
    username: { type: String, required: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    refreshToken: { type: Array, required: false },
});
const UserModel = (0, mongoose_1.model)('Users', UserSchema);
exports.default = UserModel;
