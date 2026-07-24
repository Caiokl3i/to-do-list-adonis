/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  auth: {
    newAccount: {
      store: typeof routes['auth.new_account.store']
    }
    accessTokens: {
      store: typeof routes['auth.access_tokens.store']
    }
  }
  profile: {
    profile: {
      show: typeof routes['profile.profile.show']
    }
    accessTokens: {
      destroy: typeof routes['profile.access_tokens.destroy']
    }
  }
  todos: {
    todos: {
      index: typeof routes['todos.todos.index']
      show: typeof routes['todos.todos.show']
      store: typeof routes['todos.todos.store']
      update: typeof routes['todos.todos.update']
      destroy: typeof routes['todos.todos.destroy']
    }
  }
}
