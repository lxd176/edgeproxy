import { connect } from 'cloudflare:sockets'
import { Protocol } from './consts'
import { safeCloseWebSocket } from './utils'
import type { Header } from './protocol'

function retry(proxyIPs: string[]): Socket | undefined {
  for (const proxyIP of proxyIPs) {
    try {
      const socket = connect(proxyIP)
      return socket
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
      continue
    }
  }

  return undefined
}

export async function processTCP(
  ws: WebSocket,
  header: Header,
  proxyIPs: string[],
) {
  let socket: Socket | undefined
  try {
    socket = connect({ hostname: header.address, port: header.port })
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_) {
    socket = retry(proxyIPs)
  }
  if (socket === undefined) {
    throw Error(
      `cannot connect to hostname: ${header.address}, port: ${header.port}`,
    )
  }
  await socket.opened
  ws.send(Protocol.RESPONSE_DATA(header.version))

  const writer = socket.writable.getWriter()
  await writer.write(header.rawData)
  ws.addEventListener('message', async (event) => {
    await writer.write(event.data)
  })
  ws.addEventListener('close', async () => {
    await socket.close()
  })
  ws.addEventListener('error', async () => {
    await socket.close()
  })

  await socket.readable.pipeTo(
    new WritableStream({
      write(chunk) {
        ws.send(chunk)
      },
      abort() {
        safeCloseWebSocket(ws)
      },
      close() {
        safeCloseWebSocket(ws)
      },
    }),
  )
}
