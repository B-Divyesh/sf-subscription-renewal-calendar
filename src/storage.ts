import type { Subscription } from './domain';

const databaseName = 'renewal-ledger';
function open(space: string): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(`${databaseName}:${space}`, 1);
    request.onupgradeneeded = () => request.result.createObjectStore('subscriptions', { keyPath: 'id' });
    request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error);
  });
}
export async function readSubscriptions(space: string): Promise<Subscription[]> {
  const db = await open(space); return new Promise((resolve, reject) => {
    const request = db.transaction('subscriptions').objectStore('subscriptions').getAll();
    request.onsuccess = () => resolve(request.result as Subscription[]); request.onerror = () => reject(request.error);
  });
}
export async function saveSubscriptions(space: string, items: Subscription[]): Promise<void> {
  const db = await open(space); return new Promise((resolve, reject) => {
    const tx = db.transaction('subscriptions', 'readwrite'); const store = tx.objectStore('subscriptions'); store.clear(); items.forEach((item) => store.put(item));
    tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error);
  });
}
export async function clearSubscriptions(space: string): Promise<void> { await saveSubscriptions(space, []); }
