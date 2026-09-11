// Discount codes, without opening the Stripe dashboard.
//
// The form defaults to the cautious end on purpose: one redemption, seven days, restricted to a
// single plan. A promotion code is typed in by customers on the live checkout page, so the cost of
// a careless one is real money, and the Worker refuses anything uncapped or unexpiring anyway.
import { useEffect, useState } from 'react'
import { useToast } from '../components/ui/Toast'
import { adminApi, describeAdminError, readSession, type Promo, type PromoInput } from './adminApi'
import { Card, Field, Num, Toggle } from './fields'

const PLANS: { value: NonNullable<PromoInput['plan']>; label: string }[] = [
  { value: 'lifetime', label: 'Lifetime only ($119 once)' },
  { value: 'pro', label: 'Pro only ($3.99/mo)' },
  { value: 'api', label: 'API only ($19.99/mo)' },
  { value: 'any', label: 'Any plan' },
]

const fmtDate = (unix: number | null) => (unix ? new Date(unix * 1000).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'no expiry')

/** Unambiguous by design: no O/0 or I/1, so a code read aloud or retyped lands correctly. */
function suggest(prefix: string): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const bytes = crypto.getRandomValues(new Uint8Array(6))
  return `${prefix}-${[...bytes].map((b) => alphabet[b % alphabet.length]).join('')}`
}

export function PromoAdmin() {
  const { toast } = useToast()
  const [signedIn] = useState(() => !!readSession())
  const [promos, setPromos] = useState<Promo[] | null>(null)
  const [busy, setBusy] = useState(false)
  const [form, setForm] = useState<PromoInput>({ code: suggest('TEST'), percentOff: 100, maxRedemptions: 1, expiresInDays: 7, plan: 'lifetime', firstTimeOnly: false })
  const [made, setMade] = useState<Promo | null>(null)

  const load = () => {
    if (!readSession()) return
    adminApi
      .promos()
      .then((r) => setPromos(r.promos))
      .catch(() => setPromos([]))
  }
  useEffect(load, [])

  const set = <K extends keyof PromoInput>(k: K, v: PromoInput[K]) => setForm((f) => ({ ...f, [k]: v }))

  const create = async () => {
    setBusy(true)
    try {
      const promo = await adminApi.createPromo(form)
      setMade(promo)
      setForm((f) => ({ ...f, code: suggest('TEST') }))
      load()
      toast(`${promo.code} is live`)
    } catch (e) {
      toast(describeAdminError(e), 'error')
    } finally {
      setBusy(false)
    }
  }

  if (!signedIn) {
    return (
      <Card title="Discount codes" desc="Create and retire Stripe promotion codes without leaving this panel.">
        <p className="alarm" style={{ fontWeight: 700, margin: 0 }}>
          Sign in on the Publish &amp; data tab first.
        </p>
      </Card>
    )
  }

  return (
    <>
      <Card title="New discount code" desc="The customer types this at checkout. Stripe applies it to the first payment only, so a monthly plan is discounted once rather than for ever.">
        <Field label="Code" hint="Uppercased automatically. Letters, digits, dot, dash and underscore.">
          <div className="row" style={{ gap: '0.4rem', flexWrap: 'nowrap' }}>
            <input className="input mono" value={form.code} onChange={(e) => set('code', e.target.value.toUpperCase())} />
            <button className="btn btn-sm" type="button" onClick={() => set('code', suggest('TEST'))}>
              Suggest
            </button>
          </div>
        </Field>

        <div className="grid grid-2" style={{ gap: '0 1rem' }}>
          <Num label="Discount %" value={form.percentOff} min={1} max={100} onChange={(v) => set('percentOff', v)} />
          <Num label="How many times it can be used" value={form.maxRedemptions} min={1} max={1000} onChange={(v) => set('maxRedemptions', v)} hint="One is right for testing a purchase." />
          <Num label="Expires in (days)" value={form.expiresInDays} min={1} max={365} onChange={(v) => set('expiresInDays', v)} hint="Required. A code with no end date outlives the reason it was made." />
          <Field label="Applies to" hint="Restricting it means a test code for one plan cannot buy another.">
            <select className="input" value={form.plan} onChange={(e) => set('plan', e.target.value as PromoInput['plan'])}>
              {PLANS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Toggle label="First order only" value={!!form.firstTimeOnly} onChange={(v) => set('firstTimeOnly', v)} hint="Stripe refuses the code for anyone who has bought before." />

        {form.percentOff === 100 && form.maxRedemptions > 1 && (
          <p className="alarm" style={{ fontSize: '0.85rem', fontWeight: 700 }}>
            This gives the product away {form.maxRedemptions} times if the code gets out.
          </p>
        )}

        <button className="btn btn-acid" disabled={busy} onClick={create}>
          {busy ? 'Creating…' : 'Create the code'}
        </button>

        {made && (
          <div className="card card-flat" style={{ marginTop: '1rem', borderColor: 'var(--acid)' }}>
            <div className="muted" style={{ fontSize: '0.8rem' }}>Give this to whoever is using it:</div>
            <div className="mono" style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0.3rem 0' }}>{made.code}</div>
            <div className="muted" style={{ fontSize: '0.8rem' }}>
              {made.percentOff}% off · {made.maxRedemptions ?? '∞'} use{made.maxRedemptions === 1 ? '' : 's'} · expires {fmtDate(made.expiresAt)}
            </div>
          </div>
        )}
      </Card>

      <Card title="Existing codes" desc="Stripe keeps a used code for ever so past orders keep their history. Turning one off stops it working from now on.">
        {promos === null && <p className="muted">Loading…</p>}
        {promos?.length === 0 && <p className="muted" style={{ margin: 0 }}>No codes yet.</p>}
        <div className="stack" style={{ gap: '0.4rem' }}>
          {promos?.map((p) => (
            <div key={p.id} className="file-row">
              <span className="name mono">
                {p.code}
                {!p.active && <span className="muted" style={{ fontWeight: 400 }}> · off</span>}
              </span>
              <span className="size">
                {p.percentOff}% · used {p.timesRedeemed}
                {p.maxRedemptions ? ` of ${p.maxRedemptions}` : ''} · {fmtDate(p.expiresAt)}
              </span>
              {p.active && (
                <button
                  className="btn btn-sm btn-ghost"
                  onClick={async () => {
                    if (!confirm(`Turn off ${p.code}? Nobody will be able to use it again.`)) return
                    try {
                      await adminApi.deactivatePromo(p.id)
                      load()
                      toast(`${p.code} is off`)
                    } catch (e) {
                      toast(describeAdminError(e), 'error')
                    }
                  }}
                >
                  Turn off
                </button>
              )}
            </div>
          ))}
        </div>
      </Card>
    </>
  )
}
