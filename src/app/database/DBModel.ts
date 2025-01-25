'use client';
import {decryptData, encryptData, EncryptedData} from '@/app/utils/crypto.ts';

export interface IDBData {
  id: string;
  updated: number | string;
  [key: string]: string | number | boolean | undefined | string[];
}

export interface IDBTextEntry extends IDBData {
  name: string;
  content: string;
  group?: string;
}

export interface IDBCollection {
  [key: string]: IDBData[] | undefined;
}

export default abstract class DBModel {
  protected _data: IDBCollection;
  protected _tables: string[];
  protected _name: string;
  protected _timeout: NodeJS.Timeout | undefined;

  constructor(options?: {tables: string[]; name?: string}) {
    this._data =
      options?.tables.reduce((data, table) => {
        data[table] = data[table] || [];
        return data;
      }, {} as IDBCollection) ?? {};
    this._tables = options?.tables || [];
    this._name = options?.name ?? 'MainDB';
  }

  abstract load(): Promise<IDBCollection>;
  abstract save(): Promise<void>;
  abstract saveIn(ms: number): void;

  getAll(table: string): IDBData[] {
    return (this._data[table] || []).filter((d) => !d.deleted);
  }

  get(id: string, table: string): IDBData | undefined {
    return this._data[table]?.find((d) => d.id === id);
  }

  forEach(
    callback: (data: IDBData, index: number, array: IDBData[]) => unknown,
    table: string
  ): void {
    this._data[table]?.forEach(callback);
  }
  map(
    callback: (data: IDBData, index: number, array: IDBData[]) => unknown,
    table: string
  ): unknown[] | undefined {
    return this._data[table]?.map(callback);
  }
  find(callback: () => unknown, table: string): IDBData | undefined {
    return this._data[table]?.find(callback);
  }

  abstract update(data: IDBData, table: string): Promise<IDBData | null>;
  abstract remove(id: string, table: string): Promise<IDBData | null>;

  abstract push(data: IDBData, table: string): Promise<IDBData>;
  abstract unshift(data: IDBData, table: string): Promise<IDBData>;

  static async encryptDoc(doc: IDBData) {
    if (doc.content && typeof doc.content === 'string') {
      const {encrypted, salt, iv} = await encryptData(doc.content);
      delete doc.content;
      doc.encrypted = encrypted;
      doc.salt = salt;
      doc.iv = iv;
    }
    return doc;
  }

  static async decryptDoc(doc: IDBData) {
    if (doc.encrypted) {
      doc.content = await decryptData(doc as unknown as EncryptedData);
      if (doc.content) {
        delete doc.iv;
        delete doc.salt;
        delete doc.encrypted;
      }
    }
    return doc;
  }

  getLatestTime(table: string) {
    const data = this._data[table] ?? [];
    let after = 0;
    data.forEach((data) => {
      const updated = Number(data.updated);
      if (!Number.isNaN(updated) && updated > after) {
        after = updated;
      }
    });
    return after;
  }

  async batch(
    dataToAdd: IDBData[],
    dataToUpdate: IDBData[],
    dataToRemove: IDBData[],
    table: string
  ) {
    for (const data of dataToAdd) {
      await this.push(data, table);
    }
    for (const data of dataToUpdate) {
      await this.update(data, table);
    }
    for (const data of dataToRemove) {
      await this.remove(data.id, table);
    }
  }

  static async sync(models: DBModel[], table: string) {
    const buffer = new Map<string, IDBData>();

    // Gather all data in buffer
    for (const entry of models.map((m) => m.getAll(table)).flat()) {
      if (
        !buffer.has(entry.id) ||
        Number(buffer.get(entry.id)?.updated) < Number(entry.updated)
      ) {
        buffer.set(entry.id, entry);
      }
    }

    // Check model data against buffer
    for (const model of models) {
      const dataToAdd: IDBData[] = [];
      const dataToUpdate: IDBData[] = [];
      const dataToRemove: IDBData[] = [];
      for (const [id, entry] of buffer) {
        if (entry.deleted) {
          dataToRemove.push(entry);
        }
        const modelData = model.get(id, table);
        if (!modelData) {
          dataToAdd.push(entry);
        } else if (Number(entry?.updated) > Number(modelData?.updated)) {
          dataToUpdate.push(entry);
        }
      }
      await model.batch(dataToAdd, dataToUpdate, dataToRemove, table);
    }
  }
}
