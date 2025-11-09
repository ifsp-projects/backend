import { FastifyInstance, onRequestHookHandler } from 'fastify'

type RouteOptions = {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'CREATE'
  path: string
  schema?: object
  middlewares?: onRequestHookHandler[]
}

const routes: { target: any; options: RouteOptions; handlerName: string }[] = []

export function Route(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'CREATE',
  path: string,
  options?: {
    schema?: object
    middlewares?: onRequestHookHandler[]
  }
): MethodDecorator {
  return function (
    target: Object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ): void {
    routes.push({
      target: target.constructor.prototype,
      options: {
        method,
        path,
        schema: options?.schema,
        middlewares: options?.middlewares
      },
      handlerName: propertyKey as string
    })
  }
}

export function registerRoutes(fastify: FastifyInstance, controllers: any[]) {
  for (const controller of controllers) {
    for (const route of routes) {
      if (Object.getPrototypeOf(controller) === route.target) {
        const { options, handlerName } = route
        const handler = controller[handlerName].bind(controller)

        fastify.route({
          method: options.method,
          url: options.path,
          schema: options.schema,
          onRequest: options.middlewares,
          handler
        })

        console.log(`Rota registrada: ${options.method} ${options.path}`)
      }
    }
  }
}
