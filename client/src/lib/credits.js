const OWNER_KEY = 'manara_credits_owner'
const BALANCE_KEY_PREFIX = 'manara_credits_balance'
const LEDGER_KEY_PREFIX = 'manara_credits_ledger'
const LEGACY_BALANCE_KEY = 'manara_credits_balance'
const LEGACY_LEDGER_KEY = 'manara_credits_ledger'
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

const getActiveOwner = () => {
  if (typeof window === 'undefined') return null
  const owner = localStorage.getItem(OWNER_KEY)
  if (!owner || !owner.trim()) return null
  return owner.trim()
}

const getScopedKeys = () => {
  const owner = getActiveOwner()
  if (!owner) return null
  return {
    balanceKey: `${BALANCE_KEY_PREFIX}:${owner}`,
    ledgerKey: `${LEDGER_KEY_PREFIX}:${owner}`,
  }
}

const migrateLegacyIfNeeded = (keys) => {
  if (!keys || typeof window === 'undefined') return

  const hasScopedBalance = localStorage.getItem(keys.balanceKey) !== null
  const hasScopedLedger = localStorage.getItem(keys.ledgerKey) !== null
  const legacyBalance = localStorage.getItem(LEGACY_BALANCE_KEY)
  const legacyLedger = localStorage.getItem(LEGACY_LEDGER_KEY)

  if (!hasScopedBalance && legacyBalance !== null) {
    localStorage.setItem(keys.balanceKey, legacyBalance)
    localStorage.removeItem(LEGACY_BALANCE_KEY)
  }
  if (!hasScopedLedger && legacyLedger !== null) {
    localStorage.setItem(keys.ledgerKey, legacyLedger)
    localStorage.removeItem(LEGACY_LEDGER_KEY)
  }
}

const ensureStorage = () => {
  if (typeof window === 'undefined') return null
  const keys = getScopedKeys()
  if (!keys) return null

  migrateLegacyIfNeeded(keys)

  if (localStorage.getItem(keys.balanceKey) === null) {
    localStorage.setItem(keys.balanceKey, String(DEFAULT_BALANCE))
  }
  if (localStorage.getItem(keys.ledgerKey) === null) {
    localStorage.setItem(keys.ledgerKey, JSON.stringify([]))
  }
  return keys
}

export const getCreditsBalance = () => {
  if (typeof window === 'undefined') return DEFAULT_BALANCE
  const keys = ensureStorage()
  if (!keys) return DEFAULT_BALANCE
  const raw = localStorage.getItem(keys.balanceKey)
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? parsed : DEFAULT_BALANCE
}

export const setCreditsBalance = (nextBalance) => {
  if (typeof window === 'undefined') return DEFAULT_BALANCE
  const keys = ensureStorage()
  if (!keys) return DEFAULT_BALANCE
  const safeBalance = Number.isFinite(nextBalance) ? Math.max(0, nextBalance) : DEFAULT_BALANCE
  localStorage.setItem(keys.balanceKey, String(safeBalance))
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('manara:credits-updated'))
  }
  return safeBalance
}

export const getCreditLedger = () => {
  if (typeof window === 'undefined') return []
  const keys = ensureStorage()
  if (!keys) return []
  return safeParse(localStorage.getItem(keys.ledgerKey), [])
}

const pushLedgerEntry = (entry) => {
  if (typeof window === 'undefined') return []
  const keys = ensureStorage()
  if (!keys) return []
  const ledger = getCreditLedger()
  const nextLedger = [entry, ...ledger].slice(0, 50)
  localStorage.setItem(keys.ledgerKey, JSON.stringify(nextLedger))
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
