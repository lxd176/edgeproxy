import { connect } from 'cloudflare:sockets'
import { safeCloseWebSocket } from './utils'
import { Protocol } from './consts'
import type { Header } from './protocol'

export async function processDNS(ws: WebSocket, header: Header) {
  const socket = connect({
    hostname: '8.8.8.8',
    port: 53,
  })
  await socket.opened
  ws.send(Protocol.RESPONSE_DATA(header.version))

  const writer = socket.writable.getWriter()
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
