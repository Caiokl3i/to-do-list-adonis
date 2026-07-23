import Todo from "#models/todo";
import { BaseTransformer } from "@adonisjs/core/transformers";


export default class TodoTransformer extends BaseTransformer<Todo> {
    toObject() {
        return this.pick(this.resource, [
            'id',
            'title',
            'description',
            'completed',
            'createdAt',
            'updatedAt'
        ])
    }
}