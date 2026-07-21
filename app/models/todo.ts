import { TodoSchema } from '#database/schema'
import User from './user.ts'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'


export default class Todo extends TodoSchema {

    @belongsTo(() => User)
    declare user: BelongsTo<typeof User>
    
}