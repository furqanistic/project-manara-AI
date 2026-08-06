import React from 'react'
import { Check } from 'lucide-react'
import { Label, Reveal } from './primitives'

const FEATURES = [
  'Brand consistency across every output',
  'Team permissions per role',
  'Review and approval workflow',
  'Version history on every asset',
  'English and Arabic content',
  'Compliance and permit information',
  'Property analytics',
  'Lead tracking end to end',
]

const APPROVALS = [
  { item: 'Floor plan — branded', state: 'Approved', by: 'Layla H.', done: true },
  { item: 'Interior renders v02', state: 'In review', by: 'Omar S.', done: false },
  { item: 'Brochure & listing copy', state: 'Approved', by: 'Layla H.', done: true },
  { item: 'Property page — EN / AR', state: 'Pending', by: '—', done: false },
]

const VERSIONS = [
  { v: 'v14', t: '2 HRS AGO', note: 'Approved — final renders' },
  { v: 'v13', t: '5 HRS AGO', note: 'Comments applied' },
  { v: 'v12', t: 'YESTERDAY', note: 'Arabic copy added' },
]

const METRICS = [
  { k: 'LEADS', v: '214' },
  { k: 'PAGE VIEWS', v: '1,284' },
  { k: 'WHATSAPP', v: '68%' },
]

const SOURCES = [
  { name: 'Property page', pct: 42 },
  { name: 'Portal listing', pct: 31 },
  { name: 'WhatsApp share', pct: 18 },
  { name: 'Social', pct: 9 },
]

const Agencies = () => {
  return (
    <section id='agencies' className='relative bg-ivory py-24 md:py-36'>
      <div className='max-w-[1500px] mx-auto px-6 md:px-12'>
        {/* Header */}
        <div className='grid lg:grid-cols-12 gap-10 items-end mb-16 md:mb-24'>
          <div className='lg:col-span-8'>
            <Reveal>
              <Label>08 / BUILT FOR AGENCIES</Label>
            </Reveal>
            <Reveal delay={0.08}>
              <h2 className='mt-6 font-serif text-4xl sm:text-5xl lg:text-6xl leading-[1.06] tracking-[-0.01em] text-charcoal'>
                Created for the way property teams actually work.
              </h2>
            </Reveal>
          </div>
          <div className='lg:col-span-4'>
            <Reveal delay={0.16}>
              <p className='text-[15px] leading-[1.85] text-stone'>
                One controlled system for every listing in the portfolio — with
                the brand, the approvals, and the numbers in view.
              </p>
            </Reveal>
          </div>
        </div>

        {/* Views */}
        <div className='grid lg:grid-cols-12 gap-6'>
          {/* Brand consistency */}
          <Reveal delay={0.08} className='lg:col-span-4'>
            <div className='h-full border border-beige bg-white rounded-[10px] p-6 md:p-7 flex flex-col'>
              <p className='label-meta'>VIEW 01 — BRAND CONSISTENCY</p>
              <p className='mt-3 font-serif text-xl text-charcoal'>
                One brand kit, every asset.
              </p>

              <div className='mt-6 flex gap-3'>
                <div className='flex-1 bg-charcoal rounded-[8px] p-4'>
                  <p className='text-[7px] tracking-[0.25em] uppercase text-[#c3a886]'>
                    COVER 01
                  </p>
                  <p className='mt-3 font-serif text-ivory text-base leading-tight'>
                    The Skyline
                  </p>
                </div>
                <div className='flex-1 bg-manara rounded-[8px] p-4'>
                  <p className='text-[7px] tracking-[0.25em] uppercase text-ivory/70'>
                    COVER 02
                  </p>
                  <p className='mt-3 font-serif text-ivory text-base leading-tight'>
                    Villa Four
                  </p>
                </div>
              </div>

              <div className='mt-6 flex flex-col border-t border-beige'>
                {[
                  ['Logo & wordmark', 'Manāra Estate Partners'],
                  ['Typography', 'Instrument Serif + Manrope'],
                  ['Palette', '#8D775E / #171614 / #F5F2EC'],
                  ['Tone of voice', 'Quiet, confident, precise'],
                ].map(([k, v]) => (
                  <div
                    key={k}
                    className='flex items-start justify-between gap-4 py-3 border-b border-beige'
                  >
                    <span className='text-[10px] font-semibold tracking-[0.2em] uppercase text-stone'>
                      {k}
                    </span>
                    <span className='text-[11.5px] text-charcoal/80 text-right'>
                      {v}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Approvals */}
          <Reveal delay={0.14} className='lg:col-span-4'>
            <div className='h-full border border-beige bg-white rounded-[10px] p-6 md:p-7 flex flex-col'>
              <p className='label-meta'>VIEW 02 — REVIEW & APPROVAL</p>
              <p className='mt-3 font-serif text-xl text-charcoal'>
                Nothing ships unreviewed.
              </p>

              <div className='mt-6 flex flex-col'>
                {APPROVALS.map((a) => (
                  <div
                    key={a.item}
                    className='flex items-center justify-between gap-4 py-3.5 border-b border-beige'
                  >
                    <div className='flex items-center gap-3 min-w-0'>
                      {a.done ? (
                        <span className='w-5 h-5 rounded-full bg-manara flex items-center justify-center shrink-0'>
                          <Check size={11} className='text-white' />
                        </span>
                      ) : (
                        <span className='w-5 h-5 rounded-full border-2 border-beige shrink-0' />
                      )}
                      <span className='text-[12.5px] text-charcoal/80 truncate'>
                        {a.item}
                      </span>
                    </div>
                    <span
                      className={`shrink-0 text-[8px] font-semibold tracking-[0.2em] uppercase px-2.5 py-1 rounded-full ${
                        a.done
                          ? 'bg-manara/10 text-manara'
                          : 'bg-beige/50 text-stone'
                      }`}
                    >
                      {a.state}
                    </span>
                  </div>
                ))}
              </div>

              <div className='mt-6'>
                <p className='text-[9px] font-semibold tracking-[0.25em] uppercase text-stone mb-3'>
                  VERSION HISTORY
                </p>
                {VERSIONS.map((v) => (
                  <div
                    key={v.v}
                    className='flex items-center justify-between py-2.5 border-b border-beige'
                  >
                    <div className='flex items-center gap-3'>
                      <span className='text-[11px] font-semibold text-manara'>
                        {v.v}
                      </span>
                      <span className='text-[11.5px] text-charcoal/70'>
                        {v.note}
                      </span>
                    </div>
                    <span className='text-[8px] tracking-[0.2em] uppercase text-stone'>
                      {v.t}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Analytics */}
          <Reveal delay={0.2} className='lg:col-span-4'>
            <div className='h-full border border-beige bg-white rounded-[10px] p-6 md:p-7 flex flex-col'>
              <p className='label-meta'>VIEW 03 — ANALYTICS & LEADS</p>
              <p className='mt-3 font-serif text-xl text-charcoal'>
                Every listing, measurable.
              </p>

              <div className='mt-6 grid grid-cols-3 gap-px bg-beige border border-beige rounded-[8px] overflow-hidden'>
                {METRICS.map((m) => (
                  <div key={m.k} className='bg-ivory p-4 text-center'>
                    <p className='font-serif text-2xl text-charcoal'>{m.v}</p>
                    <p className='mt-1 text-[8px] font-semibold tracking-[0.2em] uppercase text-stone'>
                      {m.k}
                    </p>
                  </div>
                ))}
              </div>

              <div className='mt-6'>
                <p className='text-[9px] font-semibold tracking-[0.25em] uppercase text-stone mb-4'>
                  LEAD SOURCES — LAST 30 DAYS
                </p>
                <div className='flex flex-col'>
                  {SOURCES.map((s) => (
                    <div key={s.name} className='mb-3.5'>
                      <div className='flex items-center justify-between mb-1.5'>
                        <span className='text-[11.5px] text-charcoal/75'>
                          {s.name}
                        </span>
                        <span className='text-[10px] font-semibold text-manara'>
                          {s.pct}%
                        </span>
                      </div>
                      <div className='h-1 bg-beige/60 rounded-full overflow-hidden'>
                        <div
                          className='h-full bg-manara rounded-full'
                          style={{ width: `${s.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className='mt-auto pt-6'>
                <p className='text-[10.5px] leading-relaxed text-stone'>
                  Leads arrive from every page and every share — tracked to the
                  agent, the listing, and the source.
                </p>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Feature index */}
        <div className='mt-16 md:mt-24 grid md:grid-cols-2 gap-x-16 gap-y-1'>
          {FEATURES.map((f, i) => (
            <Reveal key={f} delay={(i % 2) * 0.05}>
              <div className='flex items-baseline gap-5 py-4 border-b border-beige'>
                <span className='text-[10px] font-semibold text-manara'>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className='text-[15px] text-charcoal/85'>{f}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Agencies
