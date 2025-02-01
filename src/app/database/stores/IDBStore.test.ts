import {describe, it, expect, beforeEach, beforeAll} from 'vitest';
import 'fake-indexeddb/auto';
import IDBStore from './IDBStore.ts';

describe('IDBStore', () => {
  let store: IDBStore;

  beforeAll(async () => {
    // Create an instance of IDBStore with specified tables.
    // Note: Assuming that DBModel constructor expects an options object with {tables: string[], name: string}.
    store = new IDBStore({tables: ['users', 'posts'], name: 'testDB'});
    await store.load(); // Initialize and create stores if not existing.
  });

  beforeEach(async () => {
    // Clear data before each test
    for (const table of ['users', 'posts']) {
      const data = store.getAll(table);
      while (data.length) {
        const item = data.pop();
        if (item?.id) {
          await store.remove(item.id, table);
        }
      }
    }
  });

  it('should load empty collections', async () => {
    const data = await store.load();
    expect(data).toEqual({users: [], posts: []});
  });

  it('should push data into a table and persist it', async () => {
    const userData = {
      id: 'user1',
      name: 'John Doe',
      active: true,
      updated: new Date().getTime(),
    };
    await store.push(userData, 'users');

    const users = store.getAll('users');
    expect(users.length).toBe(1);
    expect(users[0]).toEqual(userData);

    // Reload from IDB to ensure persistence
    const newStore = new IDBStore({
      tables: ['users', 'posts'],
      name: 'testDB',
    });
    await newStore.load();
    expect(newStore.getAll('users').length).toBe(1);
    expect(newStore.getAll('users')[0]).toEqual(userData);
  });

  it('should unshift data into a table and persist it', async () => {
    const userData1 = {
      id: 'user1',
      name: 'John Doe',
      active: true,
      updated: new Date().getTime(),
    };
    const userData2 = {
      id: 'user2',
      name: 'Jane Doe',
      active: false,
      updated: new Date().getTime(),
    };

    await store.push(userData1, 'users');
    await store.unshift(userData2, 'users');

    const users = store.getAll('users');
    expect(users.length).toBe(2);
    expect(users[0]).toEqual(userData2);
    expect(users[1]).toEqual(userData1);

    // Reload from IDB to ensure persistence
    const newStore = new IDBStore({
      tables: ['users', 'posts'],
      name: 'testDB',
    });
    await newStore.load();
    const reloadedUsers = newStore.getAll('users');
    expect(reloadedUsers.length).toBe(2);
    expect(reloadedUsers[0]).toEqual(userData2);
    expect(reloadedUsers[1]).toEqual(userData1);
  });

  it('should update data in a table and persist changes', async () => {
    const userData = {
      id: 'user1',
      name: 'John Doe',
      active: true,
      updated: new Date().getTime(),
    };
    await store.push(userData, 'users');

    await store.update(
      {
        id: 'user1',
        name: 'John Smith',
        active: true,
        updated: new Date().getTime(),
      },
      'users'
    );

    const updatedUser = store.get('user1', 'users');
    expect(updatedUser?.name).toBe('John Smith');

    // Reload from IDB to ensure persistence
    const newStore = new IDBStore({
      tables: ['users', 'posts'],
      name: 'testDB',
    });
    await newStore.load();
    const reloadedUser = newStore.get('user1', 'users');
    expect(reloadedUser?.name).toBe('John Smith');
  });

  it('should remove data from a table and persist it', async () => {
    const userData = {
      id: 'user1',
      name: 'John Doe',
      active: true,
      updated: new Date().getTime(),
    };
    await store.push(userData, 'users');
    await store.remove('user1', 'users');

    const users = store.getAll('users');
    expect(users.length).toBe(0);

    // Reload from IDB to ensure persistence
    const newStore = new IDBStore({
      tables: ['users', 'posts'],
      name: 'testDB',
    });
    await newStore.load();
    expect(newStore.get(userData.id, 'users')).toBe(undefined);
  });
});
