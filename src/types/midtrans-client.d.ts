// ============================================================
// MindBloom — Type shim for midtrans-client
// File: src/types/midtrans-client.d.ts
// This package ships no TypeScript declarations of its own.
// ============================================================

declare module 'midtrans-client' {
  interface SnapConfig {
    isProduction: boolean
    serverKey:    string
    clientKey?:   string
  }

  interface TransactionResult {
    token:        string
    redirect_url: string
  }

  class Snap {
    constructor(config: SnapConfig)
    createTransaction(parameter: Record<string, unknown>): Promise<TransactionResult>
  }

  class CoreApi {
    constructor(config: SnapConfig)
    transaction: {
      status:  (orderId: string) => Promise<Record<string, unknown>>
      cancel:  (orderId: string) => Promise<Record<string, unknown>>
      expire:  (orderId: string) => Promise<Record<string, unknown>>
    }
  }

  const _default: { Snap: typeof Snap; CoreApi: typeof CoreApi }
  export default _default
}
