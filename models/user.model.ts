import {model, Model, Schema} from "mongoose";

export interface UserRefreshToken {
    token: string,
    device?: string,
    ip?: string,
    last_used?: Date,
}

export interface IUser extends Document {
    _id: Object,
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    refreshToken?: Array<UserRefreshToken>;
}
const UserSchema: Schema = new Schema({
    _id: { type: Object, required: true },
    username: { type: String, required: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    refreshToken: {type: Array, required: false},
});

const UserModel: Model<IUser> = model('Users', UserSchema);
export default UserModel;