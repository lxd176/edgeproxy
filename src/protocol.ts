import { Protocol } from './consts'
import { contains } from './utils'

function parseUUID(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf)
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0'))
  return [
    hex.slice(0, 4).join(''),
    hex.slice(4, 6).join(''),
    hex.slice(6, 8).join(''),
    hex.slice(8, 10).join(''),
    hex.slice(10, 16).join(''),
  ].join('-')
}

export interface Header {
  version: number
  isUDP: boolean
  address: string
  port: number
  rawData: ArrayBuffer
}

export function processHeader(value: ArrayBuffer, uuids: string[]): Header {
  if (value.byteLength < 24) {
    throw Error('invalid protocol header')
  }

  const dataView = new DataView(value)
  const version = dataView.getUint8(0)
  if (
    version !== Protocol.RELEASE_VERSION &&
    version !== Protocol.TESTING_VERSION
  ) {
    throw Error(`invalid protocol version ${version}`)
  }

  const uuidString = parseUUID(value.slice(1, 17))
  if (!contains(uuids, uuidString)) {
    throw Error(`invalid user ${uuidString}`)
  }

  const optionLength = dataView.getUint8(17)
  const command = dataView.getUint8(18 + optionLength)
  if (command !== Protocol.COMMAND_TCP && command !== Protocol.COMMAND_UDP) {
    throw Error(`unsupported command ${command}`)
  }

  const portIndex = 18 + optionLength + 1
  const remotePort = dataView.getUint16(portIndex)
  const addressType = dataView.getUint8(portIndex + 2)

  let remoteAddress = ''
  let addressLength: number, addressValueIndex: number
  switch (addressType) {
    case Protocol.ADDRESS_TYPE_IPV4:
      addressLength = 4
      addressValueIndex = portIndex + 3
      remoteAddress = new Uint8Array(
        value.slice(addressValueIndex, addressValueIndex + addressLength),
      ).join('.')
      break
    case Protocol.ADDRESS_TYPE_DOMAIN:
      addressLength = dataView.getUint8(portIndex + 3)
      addressValueIndex = portIndex + 4
      remoteAddress = new TextDecoder().decode(
        value.slice(addressValueIndex, addressValueIndex + addressLength),
      )
      break
    case Protocol.ADDRESS_TYPE_IPV6:
      addressLength = 16
      addressValueIndex = portIndex + 3
      remoteAddress = Array.from({ length: 8 }, (_, i) =>
        dataView.getUint16(addressValueIndex + i * 2).toString(16),
      ).join(':')
      break
    default:
      throw Error(`invalid address type ${addressType}`)
  }
  return {
    version,
    isUDP: command === Protocol.COMMAND_UDP,
    address: remoteAddress,
    port: remotePort,
    rawData: value.slice(addressValueIndex + addressLength),
  }
}
