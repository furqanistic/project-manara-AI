const BALANCE_KEY = 'manara_credits_balance'
const LEDGER_KEY = 'manara_credits_ledger'
const DEFAULT_BALANCE = 0

const safeParse = (value, fallback) => {
  if (!value) return fallback
  try {
    return JSON.parse(value)
  } catch (error) {
    return fallback
  }
}

const getId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `credit_${Date.now()}_${Math.random().toString(16).slice(2)}`
}

const ensureStorage = () => {
  if (typeof window === 'undefined') return
  if (localStorage.getItem(BALANCE_KEY) === null) {
    localStorage.setItem(BALANCE_KEY, String(DEFAULT_BALANCE))
  }
  if (localStorage.getItem(LEDGER_KEY) === null) {
    localStorage.setItem(LEDGER_KEY, JSON.stringify([]))
  }
}

export const getCreditsBalance = () => {
  if (typeof window === 'undefined') return DEFAULT_BALANCE
  ensureStorage()
  const raw = localStorage.getItem(BALANCE_KEY)
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? parsed : DEFAULT_BALANCE
}

export const setCreditsBalance = (nextBalance) => {
  if (typeof window === 'undefined') return DEFAULT_BALANCE
  const safeBalance = Number.isFinite(nextBalance) ? Math.max(0, nextBalance) : DEFAULT_BALANCE
  localStorage.setItem(BALANCE_KEY, String(safeBalance))
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('manara:credits-updated'))
  }
  return safeBalance
}

export const getCreditLedger = () => {
  if (typeof window === 'undefined') return []
  ensureStorage()
  return safeParse(localStorage.getItem(LEDGER_KEY), [])
}

const pushLedgerEntry = (entry) => {
  if (typeof window === 'undefined') return []
  const ledger = getCreditLedger()
  const nextLedger = [entry, ...ledger].slice(0, 50)
  localStorage.setItem(LEDGER_KEY, JSON.stringify(nextLedger))
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('manara:credits-updated'))
  }
  return nextLedger
}

export const addCredits = (amount, meta = {}) => {
  if (typeof window === 'undefined') return { balance: DEFAULT_BALANCE, ledger: [] }
  const delta = Number(amount) || 0
  const balance = getCreditsBalance()
  const nextBalance = setCreditsBalance(balance + Math.max(0, delta))
  const entry = {
    id: getId(),
    type: 'credit',
    amount: Math.max(0, delta),
    balance: nextBalance,
    timestamp: new Date().toISOString(),
    ...meta,
  }
  const ledger = pushLedgerEntry(entry)
  return { balance: nextBalance, ledger }
}

export const spendCredits = (amount, meta = {}) => {
  if (typeof window === 'undefined') return { ok: false, balance: DEFAULT_BALANCE, ledger: [] }
  const delta = Math.max(0, Number(amount) || 0)
  const balance = getCreditsBalance()
  if (balance < delta) {
    return { ok: false, balance, ledger: getCreditLedger() }
  }
  const nextBalance = setCreditsBalance(balance - delta)
  const entry = {
    id: getId(),
    type: 'debit',
    amount: delta,
    balance: nextBalance,
    timestamp: new Date().toISOString(),
    ...meta,
  }
  const ledger = pushLedgerEntry(entry)
  return { ok: true, balance: nextBalance, ledger }
}
