
export type DBType = 'indexedDB'|'localStorage';

export interface DBManagerProps {
    db: DBType
}

export default class DBManager {
    protected _type: DBType;
    constructor(options?: DBManagerProps) {
        this._type = options?.db ?? 'indexedDB';
    }

}
