"use client";
export interface IDBData {
    id: string,
    [key: string]: string | number | boolean | undefined
}

export interface IDBCollection  {
    [key: string]: IDBData[]|undefined
}

export default abstract class DBModel {
    protected _data: IDBCollection;
    protected _tables: string[];
    protected _name: string;
    protected _timeout: NodeJS.Timeout | undefined;

    constructor(options?: {tables: string[], name?: string}) {
        this._data = options?.tables.reduce((data, table)=> {
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
        return this._data[table] || [];
    }

    get(id: string, table: string): IDBData|undefined {
        return this._data[table]?.find(d => d.id === id);
    }

    forEach(callback: (data: IDBData, index: number, array: IDBData[]) => unknown, table: string): void {
        this._data[table]?.forEach(callback);
    }
    map(callback: (data: IDBData, index: number, array: IDBData[]) => unknown, table: string): unknown[]|undefined {
        return this._data[table]?.map(callback)
    }
    find(callback: () => unknown, table: string): IDBData|undefined {
        return this._data[table]?.find(callback);
    }

    abstract update(data: IDBData, table: string): Promise<IDBData|null>;
    abstract remove(id: string, table: string): Promise<IDBData|null>;

    abstract push(data: IDBData, table: string): Promise<IDBData>;
    abstract unshift(data: IDBData, table: string): Promise<IDBData>;
}
