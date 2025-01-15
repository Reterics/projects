'use client';
import { FirebaseApp, initializeApp } from 'firebase/app';
import {
    collection,
    getFirestore,
    query,
    Firestore,
    doc,
    setDoc,
    addDoc,
    getDocs,
    where,
    deleteDoc,
    writeBatch,
} from 'firebase/firestore';
import DBModel, { IDBData, IDBCollection } from '../DBModel';

export class FirebaseStore extends DBModel {
    private readonly _app: FirebaseApp | undefined;
    private readonly _firestore: Firestore | undefined;
    private readonly _ready: boolean;

    constructor(options?: { tables: string[]; name?: string }) {
        super(options);
        this._ready = false;

        try {
            console.log('Init with', {
                apiKey: process.env.NEXT_PUBLIC_FIREBASE_APIKEY,
                authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
                projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
                storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
                messagingSenderId:
                    process.env.NEXT_PUBLIC_FIREBASE_MESSAGE_SENDER_ID,
                appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
                measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
            });
            this._app = initializeApp({
                apiKey: process.env.NEXT_PUBLIC_FIREBASE_APIKEY,
                authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
                projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
                storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
                messagingSenderId:
                    process.env.NEXT_PUBLIC_FIREBASE_MESSAGE_SENDER_ID,
                appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
                measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
            });
            this._firestore = getFirestore(this._app);
            this._ready = true;
        } catch (e) {
            console.error(e);
        }
    }

    ready() {
        return this._ready;
    }

    async load(): Promise<IDBCollection> {
        if (!this._firestore) {
            throw new Error(
                'Firebase firestore does not exist due to activation error'
            );
        }
        for (const table of this._tables) {
            const receivedData = this._data[table] ?? [];
            const after = this.getLatestTime(table);

            const q = after
                ? query(
                      collection(this._firestore, table),
                      where('updated', '>', after)
                  )
                : query(collection(this._firestore, table));

            const querySnapshot = await getDocs(q);

            for (const doc1 of querySnapshot.docs) {
                const indexOf = receivedData.findIndex(
                    (data) => data.id === doc1.id
                );
                const data = { ...doc1.data(), id: doc1.id } as IDBData;

                if (data && !data.deleted) {
                    const decrypted =
                        (await DBModel.decryptDoc(data).catch((e) =>
                            console.error(e)
                        )) ?? data;
                    if (indexOf !== -1) {
                        receivedData[indexOf] = decrypted;
                    } else {
                        receivedData.push(decrypted);
                    }
                }
            }
        }
        return this._data;
    }

    /**
     * @deprecated
     * @description We don't need to save, since the data is always in sync
     */
    async save(): Promise<void> {
        return;
    }

    /**
     * @deprecated
     * @description We don't need to save, since the data is always in sync
     */
    saveIn(): void {
        return;
    }

    async update(data: IDBData, table: string): Promise<IDBData | null> {
        if (!this._firestore) {
            throw new Error(
                'Firebase firestore does not exist due to activation error'
            );
        }

        if (!data.id || !this._data[table]) return null;
        let idx = this._data[table].findIndex((d) => d.id === data.id);
        if (idx === -1) {
            idx = this._data[table]?.length;
            this._data[table]?.push(data);
        }

        this._data[table][idx] = data;
        this._data[table][idx].updated = new Date().getTime();
        await DBModel.encryptDoc(this._data[table][idx]);

        const modelRef = doc(collection(this._firestore, table));

        // Use setDoc with { merge: true } to update or create the document
        await setDoc(modelRef, this._data[table][idx], { merge: true }).catch(
            (e) => {
                console.error(e);
            }
        );
        return this._data[table][idx];
    }

    async remove(id: string, table: string): Promise<IDBData | null> {
        if (!this._firestore) {
            throw new Error(
                'Firebase firestore does not exist due to activation error'
            );
        }

        if (!this._data[table]) return null;
        const idx = this._data[table].findIndex((d) => d.id === id);
        if (idx === -1) return null;
        const [removed] = this._data[table].splice(idx, 1);

        await deleteDoc(doc(this._firestore, table, removed.id));

        return removed;
    }

    async push(data: IDBData, table: string): Promise<IDBData> {
        if (!this._firestore) {
            throw new Error(
                'Firebase firestore does not exist due to activation error'
            );
        }

        if (data?.id) {
            await this.update(data, table);
        } else {
            await DBModel.encryptDoc(data);
            const colRef = collection(this._firestore, table);
            await addDoc(colRef, data).catch((e) => {
                console.error(e);
            });
            this._data[table]?.push(data);
        }

        return data;
    }

    /**
     * @deprecated
     * @description We do not implement unshift since the Firebase DB is not ordered currenly
     */
    async unshift(data: IDBData, table: string): Promise<IDBData> {
        return this.push(data, table);
    }

    async batch(
        dataToAdd: IDBData[],
        dataToUpdate: IDBData[],
        dataToRemove: IDBData[],
        table: string
    ) {
        if (!this._firestore) {
            throw new Error(
                'Firebase firestore does not exist due to activation error'
            );
        }
        const batch = writeBatch(this._firestore);
        const dbData = this._data[table] ?? [];

        let commits = 0;
        for (const data of dataToAdd.concat(dataToUpdate)) {
            const modelRef = doc(this._firestore, table, data.id);
            data.updated = new Date().getTime();
            await DBModel.encryptDoc(data);
            batch.set(modelRef, data, { merge: true });
            commits++;
            const dbDocIndex = dbData.findIndex((d) => d.id === data.id);
            if (dbDocIndex !== -1) {
                dbData[dbDocIndex] = data;
            } else {
                dbData.push(data);
            }
        }

        for (const data of dataToRemove) {
            const index = dbData.findIndex((d) => d.id === data.id);
            if (index !== -1) {
                dbData.splice(index, 1);
            }
            const modelRef = doc(this._firestore, table, data.id);
            batch.delete(modelRef);
            commits++;
        }

        if (commits) {
            await batch.commit();
        }
    }
}
