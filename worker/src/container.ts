/** Durable Object wrapping one converter container instance. One job at a time per instance. */
import { Container, type StopParams } from '@cloudflare/containers'

const ACQUIRE_LEASE_MS = 20_000 // time the caller has to send the job after /_acquire
const JOB_LEASE_MS = 200_000 // hard ceiling on a single conversion (container kills jobs at 120 s)

export class Converter extends Container<Env> {
  defaultPort = 8080
  sleepAfter = '5m'
  enableInternet = false
  envVars = { JOB_TIMEOUT_SEC: '120', MAX_BYTES: '104857600' }

  private busy = false
  private leaseUntil = 0

  override async fetch(req: Request): Promise<Response> {
    const { pathname } = new URL(req.url)

    if (pathname === '/_acquire') {
      if (this.busy && Date.now() < this.leaseUntil) {
        return new Response(null, { status: 503, headers: { 'retry-after': '10' } })
      }
      this.busy = true
      this.leaseUntil = Date.now() + ACQUIRE_LEASE_MS
      return new Response(null, { status: 204 })
    }

    if (pathname === '/health') {
      await this.ensureStarted()
      return this.containerFetch(req, 8080)
    }

    if (!pathname.startsWith('/convert/')) return new Response('not found', { status: 404 })

    this.busy = true
    this.leaseUntil = Date.now() + JOB_LEASE_MS
    try {
      await this.ensureStarted()
      return await this.containerFetch(req, 8080)
    } catch (e) {
      console.error('converter failure', String(e))
      return Response.json(
        { error: 'Converter unavailable, retry shortly', code: 'container_error' },
        { status: 503, headers: { 'retry-after': '15' } },
      )
    } finally {
      this.busy = false
    }
  }

  private ensureStarted(): Promise<void> {
    return this.startAndWaitForPorts({
      ports: [8080],
      cancellationOptions: { instanceGetTimeoutMS: 30_000, portReadyTimeoutMS: 90_000 },
    })
  }

  override onStart(): void {
    console.log('converter up')
  }

  override onStop(params: StopParams): void {
    console.log('converter down', JSON.stringify(params))
  }

  override onError(error: unknown): void {
    console.error('converter error', String(error))
  }
}
