import TodoTransformer from '#transformers/todo_transformer'
import { createTodoValidator } from '#validators/todo'
import type { HttpContext } from '@adonisjs/core/http'

export default class TodosController {
  async store({ auth, request, serialize }: HttpContext) {
    const user = auth.getUserOrFail()

    const { title, description } = await request.validateUsing(createTodoValidator)

    const todo = await user.related('todos').create({ title, description })

    return serialize(TodoTransformer.transform(todo))
  }

  async index({ auth, serialize }: HttpContext) {
    const user = auth.getUserOrFail()

    const todos = await user.related('todos').query().orderBy('id', 'desc')

    return serialize(TodoTransformer.transform(todos))
  }
}