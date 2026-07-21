import vine from '@vinejs/vine'

/**
 * Regras reutilizáveis
 */
const title = () =>
  vine.string().trim().minLength(1).maxLength(255)

const description = () =>
  vine.string().trim().nullable().optional()

/**
 * Validator para criar uma tarefa
 */
export const createTodoValidator = vine.create({
  title: title(),
  description: description(),
})

/**
 * Validator para atualizar uma tarefa
 */
export const updateTodoValidator = vine.create({
  title: title().optional(),
  description: description(),
  completed: vine.boolean().optional(),
})