/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

const placeholder: any = {}

const routes = {
  'auth.new_account.store': {
    methods: ["POST"],
    pattern: '/api/v1/auth/signup',
    tokens: [{"old":"/api/v1/auth/signup","type":0,"val":"api","end":""},{"old":"/api/v1/auth/signup","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/signup","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/signup","type":0,"val":"signup","end":""}],
    types: placeholder as Registry['auth.new_account.store']['types'],
  },
  'auth.access_tokens.store': {
    methods: ["POST"],
    pattern: '/api/v1/auth/login',
    tokens: [{"old":"/api/v1/auth/login","type":0,"val":"api","end":""},{"old":"/api/v1/auth/login","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/login","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['auth.access_tokens.store']['types'],
  },
  'profile.profile.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/account/profile',
    tokens: [{"old":"/api/v1/account/profile","type":0,"val":"api","end":""},{"old":"/api/v1/account/profile","type":0,"val":"v1","end":""},{"old":"/api/v1/account/profile","type":0,"val":"account","end":""},{"old":"/api/v1/account/profile","type":0,"val":"profile","end":""}],
    types: placeholder as Registry['profile.profile.show']['types'],
  },
  'profile.access_tokens.destroy': {
    methods: ["POST"],
    pattern: '/api/v1/account/logout',
    tokens: [{"old":"/api/v1/account/logout","type":0,"val":"api","end":""},{"old":"/api/v1/account/logout","type":0,"val":"v1","end":""},{"old":"/api/v1/account/logout","type":0,"val":"account","end":""},{"old":"/api/v1/account/logout","type":0,"val":"logout","end":""}],
    types: placeholder as Registry['profile.access_tokens.destroy']['types'],
  },
  'todos.todos.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/todos',
    tokens: [{"old":"/api/v1/todos","type":0,"val":"api","end":""},{"old":"/api/v1/todos","type":0,"val":"v1","end":""},{"old":"/api/v1/todos","type":0,"val":"todos","end":""}],
    types: placeholder as Registry['todos.todos.index']['types'],
  },
  'todos.todos.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/todos/:id',
    tokens: [{"old":"/api/v1/todos/:id","type":0,"val":"api","end":""},{"old":"/api/v1/todos/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/todos/:id","type":0,"val":"todos","end":""},{"old":"/api/v1/todos/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['todos.todos.show']['types'],
  },
  'todos.todos.store': {
    methods: ["POST"],
    pattern: '/api/v1/todos',
    tokens: [{"old":"/api/v1/todos","type":0,"val":"api","end":""},{"old":"/api/v1/todos","type":0,"val":"v1","end":""},{"old":"/api/v1/todos","type":0,"val":"todos","end":""}],
    types: placeholder as Registry['todos.todos.store']['types'],
  },
  'todos.todos.update': {
    methods: ["PUT"],
    pattern: '/api/v1/todos/:id',
    tokens: [{"old":"/api/v1/todos/:id","type":0,"val":"api","end":""},{"old":"/api/v1/todos/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/todos/:id","type":0,"val":"todos","end":""},{"old":"/api/v1/todos/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['todos.todos.update']['types'],
  },
  'todos.todos.destroy': {
    methods: ["DELETE"],
    pattern: '/api/v1/todos/:id',
    tokens: [{"old":"/api/v1/todos/:id","type":0,"val":"api","end":""},{"old":"/api/v1/todos/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/todos/:id","type":0,"val":"todos","end":""},{"old":"/api/v1/todos/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['todos.todos.destroy']['types'],
  },
} as const satisfies Record<string, AdonisEndpoint>

export { routes }

export const registry = {
  routes,
  $tree: {} as ApiDefinition,
}

declare module '@tuyau/core/types' {
  export interface UserRegistry {
    routes: typeof routes
    $tree: ApiDefinition
  }
}
