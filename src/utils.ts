export function contains<T>(arr: T[], value: T): boolean {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === value) {
      return true
    }
  }

  return false
}

export function safeCloseWebSocket(ws: WebSocket) {
  try {
    if (
      ws.readyState === WebSocket.READY_STATE_OPEN ||
      ws.readyState == WebSocket.READY_STATE_CLOSING
    ) {
      ws.close()
    }
  } catch (err) {
    console.error(`close WebSocket error: ${err}`)
  }
}
