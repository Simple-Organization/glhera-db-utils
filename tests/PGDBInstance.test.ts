import 'dotenv/config';
import pg from 'pg';
import { z } from 'zod';
import { PGDBInstance } from '../src/drivers/pg';
import test, { expect } from '@playwright/test';

//
//

test.describe('PGDBInstance', () => {
  let client!: pg.Client;

  //
  // A tipagem do banco com zod
  const dbSchemas = {
    test: z.object({
      id: z.number().nullish(),
      data: z.string().min(4),
    }),
  };

  // Tipo utilitário para inferir a tipagem de um objeto Zod
  type InferTypes<T extends Record<string, z.ZodType<any, any, any>>> = {
    [K in keyof T]: z.infer<T[K]>;
  };

  //
  //

  test.beforeAll(async () => {
    const { PG_HOST, PG_USER, PG_PASSWORD, PG_DATABASE } = process.env;

    const connectionString = `postgres://${PG_USER}:${PG_PASSWORD}@${PG_HOST}:5432/${PG_DATABASE}`;

    client = new pg.Client({ connectionString });
    await client.connect();
    await client.query('DROP TABLE IF EXISTS test');
    await client.query('CREATE TABLE test (id SERIAL PRIMARY KEY, data TEXT)');
  });

  //
  //

  test('Must insert a row and return it', async () => {
    //
    //

    const pgDB = new PGDBInstance<InferTypes<typeof dbSchemas>>(client);

    const data: any = { data: 'test' };

    const result = await pgDB.insert('test', data, ['data']);

    expect(result).toEqual(data);
  });

  //
  //

  test('Must insert and update it', async () => {
    //
    //

    const pgDB = new PGDBInstance<InferTypes<typeof dbSchemas>>(client);

    const dataInserted = { data: 'test1' };

    const resultInsert = await pgDB.insert('test', dataInserted, ['id']);

    const dataUpdated = { data: 'testaaaa' };

    const resultUpdated = await pgDB.update('test', dataUpdated, {
      id: resultInsert.id!,
    });

    expect(resultUpdated).toEqual(1);
  });

  //
  //

  test('Must insert a row and only return it with `.single()`', async () => {
    //
    //

    const pgDB = new PGDBInstance<InferTypes<typeof dbSchemas>>(client);

    const data: any = { data: 'test' };

    const result = await pgDB.insert('test', data, ['id']);

    const resultSingle = await pgDB.single(
      'SELECT data FROM test WHERE id = $1',
      [result.id!],
    );

    expect(resultSingle).toEqual(data);
  });

  //
  //

  test('Must throw if tries to access more than one row with `.single()`', async () => {
    //
    //

    const pgDB = new PGDBInstance<InferTypes<typeof dbSchemas>>(client);

    const data: any = { data: 'test' };

    await pgDB.insert('test', data, ['id']);
    await pgDB.insert('test', data, ['id']);

    await expect(async () => {
      await pgDB.single('SELECT data FROM test');
    }).rejects.toThrow();
  });

  //
  //

  test('Must ready multiple rows with `.rows()`', async () => {
    //
    //

    const pgDB = new PGDBInstance<InferTypes<typeof dbSchemas>>(client);

    const data: any = { data: 'test - multiple - rows' };

    await pgDB.insert('test', data);
    await pgDB.insert('test', data);

    const resultRows = await pgDB.rows(
      'SELECT data FROM test WHERE data = $1',
      ['test - multiple - rows'],
    );

    expect(resultRows).toEqual([
      { data: 'test - multiple - rows' },
      { data: 'test - multiple - rows' },
    ]);
  });

  //
  //

  test('Must insert a row and validate it with zod', async () => {
    //
    //

    const pgDB = new PGDBInstance<InferTypes<typeof dbSchemas>>(
      client,
      (table, values) => (dbSchemas as any)[table].parse(values), // Insert
    );

    const data: any = { data: 't' }; // The schema is defined to only accept strings with 4 characters or more

    await expect(async () => {
      await pgDB.insert('test', data, ['data']);
    }).rejects.toThrow();
  });

  //
  //

  test('Must insert a row and validate it with zod and work if correctly', async () => {
    //
    //

    const pgDB = new PGDBInstance<InferTypes<typeof dbSchemas>>(
      client,
      (table, values) => (dbSchemas as any)[table].parse(values), // Insert
    );

    const data: any = { data: 'test' };

    await pgDB.insert('test', data, ['data']);
  });

  //
  //

  test('Must update a row and validate it with zod', async () => {
    //
    //

    const pgDB = new PGDBInstance<InferTypes<typeof dbSchemas>>(
      client,
      (table, values) => (dbSchemas as any)[table].parse(values), // Insert
      (table, values) => (dbSchemas as any)[table].parse(values), // Insert
    );

    const dataInserted = { data: 'test1' };

    const resultInsert = await pgDB.insert('test', dataInserted, ['id']);

    const dataUpdated: any = { data: 't' }; // The schema is defined to only accept strings with 4 characters or more

    await expect(async () => {
      await pgDB.update('test', dataUpdated, {
        id: resultInsert.id!,
      });
    }).rejects.toThrow();
  });

  //
  //

  test('Must update a row and validate it with zod and work if correctly', async () => {
    //
    //

    const pgDB = new PGDBInstance<InferTypes<typeof dbSchemas>>(
      client,
      (table, values) => (dbSchemas as any)[table].parse(values), // Insert
    );

    const data: any = { data: 'test' };

    const result = await pgDB.insert('test', data, ['id']);
    
    await pgDB.update('test', data, {
      id: result.id!,
    });
  });
});
