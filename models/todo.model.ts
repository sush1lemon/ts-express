import {model, Model, Schema} from "mongoose";

export interface ITodo extends Document {
    _id?: Object,
    user_id?: Object;
    title: string;
    content: string;
    status: boolean;
}

const TodoSchema: Schema = new Schema({
    _id: {type: Object, required: false},
    user_id: {type: Object, required: false},
    title: {type: String, required: true},
    content: {type: String, required: true},
    status: {type: Boolean, required: true},
});

const TodoModel: Model<ITodo> = model("Todos", TodoSchema)
export default TodoModel;