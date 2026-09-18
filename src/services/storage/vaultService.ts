import type { VaultItem, VaultMeta } from '@/types'

const DB_NAME = 'pdfkit_vault'
const DB_VERSION = 1
const STORE_FILES = 'files'
const STORE_META = 'meta'

let db: IDBDatabase | null = null

async function getDB(): Promise<IDBDatabase> {
  if (db) return db
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      db = request.result
      resolve(db)
    }
    request.onupgradeneeded = e => {
      const database = (e.target as IDBOpenDBRequest).result
      if (!database.objectStoreNames.contains(STORE_FILES)) {
        database.createObjectStore(STORE_FILES, { keyPath: 'id' })
      }
      if (!database.objectStoreNames.contains(STORE_META)) {
        const metaStore = database.createObjectStore(STORE_META, { keyPath: 'id' })
        metaStore.createIndex('collection', 'collection', { unique: false })
        metaStore.createIndex('isFavorite', 'isFavorite', { unique: false })
        metaStore.createIndex('createdAt', 'createdAt', { unique: false })
      }
    }
  })
}

// ─── Save to Vault ─────────────────────────────────────────────────────────────

export async function saveToVault(file: File, meta: VaultMeta): Promise<VaultItem> {
  const database = await getDB()
  const id = crypto.randomUUID()
  const now = new Date()

  const item: VaultItem = {
    id,
    name: meta.name || file.name,
    description: meta.description,
    tags: meta.tags ?? [],
    collection: meta.collection,
    isFavorite: meta.isFavorite ?? false,
    fileType: file.name.split('.').pop()?.toUpperCase() ?? 'FILE',
    mimeType: file.type || 'application/octet-stream',
    size: file.size,
    createdAt: now,
    updatedAt: now
  }

  const fileData = await file.arrayBuffer()

  await new Promise<void>((resolve, reject) => {
    const t = database.transaction([STORE_FILES, STORE_META], 'readwrite')
    t.objectStore(STORE_FILES).put({ id, data: fileData, mimeType: file.type })
    t.objectStore(STORE_META).put(item)
    t.oncomplete = () => resolve()
    t.onerror = () => reject(t.error)
  })

  return item
}

// ─── Get File Data ─────────────────────────────────────────────────────────────

export async function getFileFromVault(id: string): Promise<{ data: ArrayBuffer; mimeType: string }> {
  const database = await getDB()
  return new Promise((resolve, reject) => {
    const t = database.transaction(STORE_FILES, 'readonly')
    const req = t.objectStore(STORE_FILES).get(id)
    req.onsuccess = () => {
      if (req.result) {
        resolve({ data: req.result.data, mimeType: req.result.mimeType })
      } else {
        reject(new Error('File not found in vault'))
      }
    }
    req.onerror = () => reject(req.error)
  })
}

// ─── List Vault Items ──────────────────────────────────────────────────────────

export async function listVault(): Promise<VaultItem[]> {
  const database = await getDB()
  return new Promise((resolve, reject) => {
    const t = database.transaction(STORE_META, 'readonly')
    const req = t.objectStore(STORE_META).getAll()
    req.onsuccess = () => resolve(req.result.map(item => ({
      ...item,
      createdAt: new Date(item.createdAt),
      updatedAt: new Date(item.updatedAt)
    })))
    req.onerror = () => reject(req.error)
  })
}

// ─── Delete from Vault ─────────────────────────────────────────────────────────

export async function deleteFromVault(id: string): Promise<void> {
  const database = await getDB()
  await new Promise<void>((resolve, reject) => {
    const t = database.transaction([STORE_FILES, STORE_META], 'readwrite')
    t.objectStore(STORE_FILES).delete(id)
    t.objectStore(STORE_META).delete(id)
    t.oncomplete = () => resolve()
    t.onerror = () => reject(t.error)
  })
}

// ─── Update Vault Meta ─────────────────────────────────────────────────────────

export async function updateVaultMeta(
  id: string,
  updates: Partial<VaultItem>
): Promise<VaultItem> {
  const database = await getDB()
  return new Promise((resolve, reject) => {
    const t = database.transaction(STORE_META, 'readwrite')
    const store = t.objectStore(STORE_META)
    const req = store.get(id)
    req.onsuccess = () => {
      const item = {
        ...req.result,
        ...updates,
        updatedAt: new Date()
      }
      store.put(item)
      t.oncomplete = () => resolve(item)
    }
    t.onerror = () => reject(t.error)
  })
}

// ─── Get Vault Size ────────────────────────────────────────────────────────────

export async function getVaultSize(): Promise<number> {
  const items = await listVault()
  return items.reduce((sum, item) => sum + item.size, 0)
}

// ─── Download from Vault ───────────────────────────────────────────────────────

export async function downloadFromVault(item: VaultItem): Promise<void> {
  const { data, mimeType } = await getFileFromVault(item.id)
  const blob = new Blob([data], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = item.name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 10000)
}

// ─── Clear Vault ───────────────────────────────────────────────────────────────

export async function clearVault(): Promise<void> {
  const database = await getDB()
  await new Promise<void>((resolve, reject) => {
    const t = database.transaction([STORE_FILES, STORE_META], 'readwrite')
    t.objectStore(STORE_FILES).clear()
    t.objectStore(STORE_META).clear()
    t.oncomplete = () => resolve()
    t.onerror = () => reject(t.error)
  })
}
