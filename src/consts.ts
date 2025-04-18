export const Protocol = {
  TESTING_VERSION: 0,
  RELEASE_VERSION: 1,
  // Command
  COMMAND_TCP: 1,
  COMMAND_UDP: 2,
  COMMAND_MUX: 3,
  // Address type
  ADDRESS_TYPE_IPV4: 1,
  ADDRESS_TYPE_DOMAIN: 2,
  ADDRESS_TYPE_IPV6: 3,
  // Response
  RESPONSE_DATA: (v: number): ArrayBuffer => {
    return new Uint8Array([v, 0]).buffer
  },
}
