const Telegraf = require('telegraf')
const test = require('ava')
const RedisSession = require('../lib/session')

test.serial('session should be defined', (t) => {
  const app = new Telegraf()
  const session = new RedisSession()
  app.on('text', session.middleware('session', (ctx) => ctx.from && ctx.chat && `${ctx.from.id}:${ctx.chat.id}`), (ctx) => t.true('session' in ctx))
  return app.handleUpdate({message: {chat: {id: 1}, from: {id: 1}, text: 'hey'}})
})

test.serial('chatSession should be defined', (t) => {
  const app = new Telegraf()
  const session = new RedisSession()
  app.on('text', session.middleware('chatSession', (ctx) => ctx.from && ctx.chat && `${ctx.chat.id}`), (ctx) => t.true('chatSession' in ctx))
  return app.handleUpdate({message: {chat: {id: 1}, from: {id: 1}, text: 'hey'}})
})

test.serial('session should retrieve and save session', (t) => {
  const redisSession = new RedisSession()
  const key = '1:1'
  return redisSession.getSession(key)
    .then((session) => {
      t.truthy(session)
      session.foo = 42
      return redisSession.saveSession(key, session)
    })
    .then(() => {
      return redisSession.getSession(key)
    })
    .then((session) => {
      t.truthy(session)
      t.deepEqual({ foo: 42 }, session)
    })
})

test.serial('chatSession should retrieve and save session', (t) => {
  const redisSession = new RedisSession()
  const key = '1'
  return redisSession.getSession(key)
    .then((session) => {
      t.truthy(session)
      session.foo = 42
      return redisSession.saveSession(key, session)
    })
    .then(() => {
      return redisSession.getSession(key)
    })
    .then((session) => {
      t.truthy(session)
      t.deepEqual({ foo: 42 }, session)
    })
})

test.serial('session should handle existing session', (t) => {
  const app = new Telegraf()
  const session = new RedisSession()
  app.on('text',
    session.middleware('session', (ctx) => ctx.from && ctx.chat && `${ctx.from.id}:${ctx.chat.id}`),
    (ctx) => {
      t.true('session' in ctx)
      t.true('foo' in ctx.session)
      t.is(ctx.session.foo, 42)
    })
  return app.handleUpdate({message: {chat: {id: 1}, from: {id: 1}, text: 'hey'}})
})

test.serial('chatSession should handle existing session', (t) => {
  const app = new Telegraf()
  const session = new RedisSession()
  app.on('text',
    session.middleware('chatSession', (ctx) => ctx.from && ctx.chat && `${ctx.chat.id}`),
    (ctx) => {
      t.true('chatSession' in ctx)
      t.true('foo' in ctx.chatSession)
      t.is(ctx.chatSession.foo, 42)
    })
  return app.handleUpdate({message: {chat: {id: 1}, from: {id: 1}, text: 'hey'}})
})

test.serial('session should handle not existing session', (t) => {
  const app = new Telegraf()
  const session = new RedisSession()
  app.on('text',
    session.middleware('session', (ctx) => ctx.from && ctx.chat && `${ctx.from.id}:${ctx.chat.id}`),
    (ctx) => {
      t.true('session' in ctx)
      t.false('foo' in ctx.session)
    })
  return app.handleUpdate({message: {chat: {id: 1}, from: {id: 2}, text: 'hey'}})
})

test.serial('chatSession should handle not existing session', (t) => {
  const app = new Telegraf()
  const session = new RedisSession()
  app.on('text',
    session.middleware('chatSession', (ctx) => ctx.from && ctx.chat && `${ctx.chat.id}`),
    (ctx) => {
      t.true('chatSession' in ctx)
      t.false('foo' in ctx.chatSession)
    })
  return app.handleUpdate({message: {chat: {id: 2}, from: {id: 2}, text: 'hey'}})
})

test.serial('session should handle session reset', (t) => {
  const app = new Telegraf()
  const session = new RedisSession()
  app.on('text',
    session.middleware('session', (ctx) => ctx.from && ctx.chat && `${ctx.from.id}:${ctx.chat.id}`),
    (ctx) => {
      ctx.session = null
      t.truthy(ctx.session)
      t.false('foo' in ctx.session)
    })
  return app.handleUpdate({message: {chat: {id: 1}, from: {id: 1}, text: 'hey'}})
})

test.serial('chatSession should handle session reset', (t) => {
  const app = new Telegraf()
  const session = new RedisSession()
  app.on('text',
    session.middleware('chatSession', (ctx) => ctx.from && ctx.chat && `${ctx.chat.id}`),
    (ctx) => {
      ctx.chatSession = null
      t.truthy(ctx.chatSession)
      t.false('foo' in ctx.chatSession)
    })
  return app.handleUpdate({message: {chat: {id: 1}, from: {id: 1}, text: 'hey'}})
})
