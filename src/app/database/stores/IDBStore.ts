import DBModel, {IDBCollection, IDBData} from '../DBModel';

function openIDB(
  databaseName: string,
  version: number,
  storeNames: string[]
): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName, version);
    request.onupgradeneeded = () => {
      const db = request.result;
      for (const storeName of storeNames) {
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, {keyPath: 'id'});
        }
      }
    };
    request.onsuccess = () => {
      resolve(request.result);
    };
    request.onerror = () => {
      reject(request.error as Error);
    };
  });
}

async function runRequest<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error as Error);
  });
}

async function runTransaction(transaction: IDBTransaction): Promise<void> {
  return await new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error as Error);
  });
}

function getSmallerID(currentID: string): string {
  const match = RegExp(/(.*?)(\d+)$/).exec(currentID);
  if (match) {
    const prefix = match[1];
    const num = parseInt(match[2], 10);
    return `${prefix}${num - 1}`;
  }
  return `_${currentID}`;
}

function getLargerID(currentID: string): string {
  const match = RegExp(/(.*?)(\d+)$/).exec(currentID);
  if (match) {
    const prefix = match[1];
    const num = parseInt(match[2], 10);
    return `${prefix}${num + 1}`;
  }
  return `Z${currentID}`;
}

export default class IDBStore extends DBModel {
  protected _db: IDBDatabase | null = null;
  protected _version = 2;

  private async getDB(): Promise<IDBDatabase> {
    if (this._db) return this._db;
    this._db = await openIDB(this._name, this._version, this._tables);
    return this._db;
  }

  async load(): Promise<IDBCollection> {
    const db = await this.getDB();
    for (const table of this._tables) {
      const transaction = db.transaction(table, 'readonly');
      const store = transaction.objectStore(table);
      this._data[table] = (await runRequest(store.getAll())) as IDBData[];
    }
    return this._data;
  }

  async saveTable(table: string, _db?: IDBDatabase): Promise<void> {
    const db = _db || (await this.getDB());
    const transaction = db.transaction(table, 'readwrite');
    const store = transaction.objectStore(table);

    const clearRequest = store.clear();
    await runRequest(clearRequest);

    // Save current data
    const data = this._data[table] || [];
    for (const item of data) {
      store.put(await DBModel.encryptDoc(item));
    }

    await runTransaction(transaction);
  }
  async save(): Promise<void> {
    const db = await this.getDB();
    for (const table of this._tables) {
      await this.saveTable(table, db);
    }
  }

  saveIn(ms: number): void {
    if (this._timeout) clearTimeout(this._timeout);
    this._timeout = setTimeout(() => {
      this.save().catch(console.error);
    }, ms);
  }

  async push(data: IDBData, table: string): Promise<IDBData> {
    if (!this._data[table]) this._data[table] = [];
    const currentData = this._data[table];
    if (currentData.length > 0) {
      const lastItemID = currentData[currentData.length - 1].id;

      if (data.id < lastItemID) {
        data.id = getLargerID(lastItemID) + data.id;
      }
    }
    data.updated = new Date().getTime();
    await DBModel.encryptDoc(data).catch((e) => console.error(e));
    this._data[table].push(data);

    const db = await this.getDB();
    const transaction = db.transaction(table, 'readwrite');
    const store = transaction.objectStore(table);
    store.put(data);

    await runTransaction(transaction);

    return this._data[table][this._data[table]?.length - 1];
  }

  async remove(id: string, table: string): Promise<IDBData | null> {
    const items = this._data[table];
    if (!items) return null;
    const idx = items.findIndex((d) => d.id === id);
    if (idx === -1) return null;
    const [removed] = items.splice(idx, 1);

    const db = await this.getDB();
    const transaction = db.transaction(table, 'readwrite');
    const store = transaction.objectStore(table);

    await runRequest(store.delete(id));
    await runTransaction(transaction);

    return removed;
  }

  async unshift(data: IDBData, table: string): Promise<IDBData> {
    if (!this._data[table]) this._data[table] = [];
    const currentData = this._data[table];
    if (currentData.length > 0) {
      const firstItemID = currentData[0].id;

      if (firstItemID < data.id) {
        data.id = getSmallerID(firstItemID) + data.id;
      }
    }
    data.updated = new Date().getTime();
    await DBModel.encryptDoc(data).catch((e) => console.error(e));
    this._data[table].unshift(data);

    const db = await this.getDB();
    const transaction = db.transaction(table, 'readwrite');
    const store = transaction.objectStore(table);
    store.put(data);

    return this._data[table][0];
  }

  async update(data: IDBData, table: string): Promise<IDBData | null> {
    const id = data.id;
    if (!id) return null;
    const items = this._data[table];
    if (!items) return null;
    const idx = items.findIndex((d) => d.id === id);
    if (idx === -1) return null;

    items[idx] = data;
    items[idx].updated = new Date().getTime();
    await DBModel.encryptDoc(items[idx]).catch((e) => console.error(e));
    const updatedItem = items[idx];

    const db = await this.getDB();
    const transaction = db.transaction(table, 'readwrite');
    const store = transaction.objectStore(table);
    store.put(updatedItem);

    await runTransaction(transaction);

    return updatedItem;
  }
}
