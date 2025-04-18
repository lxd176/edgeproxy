import type { Env } from '.'
import { processHeader } from './protocol'
import { processTCP } from './tcp'
import { safeCloseWebSocket } from './utils'
import { processDNS } from './dns'

function decodeEarlyData(earlyData: string): ArrayBuffer {
  earlyData = earlyData.replace(/-/g, '+').replace(/_/g, '/')
  const binaryStr = atob(earlyData)
  const buffer = new ArrayBuffer(binaryStr.length)
  const view = new Uint8Array(buffer)
  for (let i = 0; i < binaryStr.length; i++) {
    view[i] = binaryStr.charCodeAt(i)
  }
  return buffer
}

function getHeader(
  ws: WebSocket,
  earlyData: string | null,
): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    if (earlyData) {
      try {
        const data = decodeEarlyData(earlyData)
        resolve(data)
      } catch (err) {
        reject(err)
      }
    }

    const handleMsg = (event: MessageEvent) => {
      if (typeof event.data === 'string') {
        reject('invalid data')
      } else {
        resolve(event.data)
      }
      ws.removeEventListener('message', handleMsg)
      ws.removeEventListener('error', handleErr)
    }

    const handleErr = (event: ErrorEvent) => {
      reject(event.error)
      ws.removeEventListener('message', handleMsg)
      ws.removeEventListener('error', handleErr)
    }

    ws.addEventListener('message', handleMsg)
    ws.addEventListener('error', handleErr)

    setTimeout(() => {
      reject('timeout')
      ws.removeEventListener('message', handleMsg)
      ws.removeEventListener('error', handleErr)
    }, 10000)
  })
}

export function processWebSocket(request: Request, env: Env): Response {
  const uuids = env.UUID.split(',').filter((v) => v !== '')
  const proxyIPs = env.PROXY_IP.split(',').filter((v) => v !== '')

  const [client, server] = Object.values(new WebSocketPair())
  if (server === undefined) {
    throw 'WebSocket server not defined'
  }
  if (client === undefined) {
    throw 'WebSocket client not defined'
  }

  server.accept()

  getHeader(server, request.headers.get('Sec-WebSocket-Protocol'))
    .then((v) => processHeader(v, uuids))
    .then(async (header) => {
      if (header.isUDP) {
        if (header.port === 53) {
          await processDNS(server, header)
        } else {
          throw Error('UDP transport is unsupported')
        }
      }

      await processTCP(server, header, proxyIPs)
    })
    .catch((err) => {
      console.error(err)
      safeCloseWebSocket(server)
    })

  return new Response(null, {
    status: 101,
    webSocket: client,
  })
}
