import { errorPage, indexPage } from './fake-pages'
import { normalSubscription } from './subscription'
import { processWebSocket } from './ws'

export interface Env {
  UUID: string
  PROXY_IP: string
}

export default {
  async fetch(
    request: Request,
    env: Env,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _: ExecutionContext,
  ): Promise<Response> {
    try {
      const upgradeHeader = request.headers.get('Upgrade')
      if (!upgradeHeader || upgradeHeader !== 'websocket') {
        const url = new URL(request.url)

        for (const uuid of env.UUID.split(',').filter((v) => v !== '')) {
          if (!request.url.includes(uuid)) {
            continue
          }
          return new Response(normalSubscription(uuid, url))
        }
        return await indexPage()
      }

      return processWebSocket(request, env)
    } catch (err) {
      console.error(err)
      return await errorPage()
    }
  },
} satisfies ExportedHandler<Env>
