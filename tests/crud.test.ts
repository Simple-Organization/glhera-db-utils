import { test, expect } from '@playwright/test';
import { generateInsertSQL, generateUpdateSQL } from '../src/crud';

//
//

test.describe('crud sql string', () => {
  //
  //

  test('Must generate insert', () => {
    //

    const [sql, values] = generateInsertSQL('table', { data: 'data' }, []);

    expect(sql).toBe('INSERT INTO table (data) VALUES ($1)');

    expect(values).toEqual(['data']);
  });

  //
  //

  test('Must generate insert with returning', () => {
    //

    const [sql, values] = generateInsertSQL('table', { data: 'data' }, ['id']);

    expect(sql).toBe('INSERT INTO table (data) VALUES ($1) RETURNING id');

    expect(values).toEqual(['data']);
  });

  //
  //

  test('Must generate insert without undefined field', () => {
    const [sql, values] = generateInsertSQL(
      'table',
      { data: 'data', id: undefined },
      [],
    );

    expect(sql).toBe('INSERT INTO table (data) VALUES ($1)');

    expect(values).toEqual(['data']);
  });

  //
  //

  test('Must throw if all fields are undefined', () => {
    //

    expect(() => {
      const [sql, values] = generateInsertSQL('table', { id: undefined }, []);
    }) //
      .toThrowError('data must have at least one property');

    expect(() => {
      const [sql, values] = generateInsertSQL('table', {}, []);
    }) //
      .toThrowError('data must have at least one property');
  });

  //
  //

  test('Must throw if the object is an array', () => {
    //

    expect(() => {
      const [sql, values] = generateInsertSQL('table', [], []);
    }) //
      .toThrowError('data cannot be an array');
  });

  //
  //

  test('Must convert object to json', () => {
    //

    const [sql, values] = generateInsertSQL(
      'table',
      { user: { name: 'Jhon' } },
      [],
    );

    expect(sql).toBe('INSERT INTO table (user) VALUES ($1)');
    expect(values).toEqual(['{"name":"Jhon"}']);
  });

  //
  //

  test('Must save primitives correctly', () => {
    //

    const [sql, values] = generateInsertSQL(
      'table',
      { name: 'Jhon', age: 20, is_active: true },
      [],
    );

    expect(sql).toBe(
      'INSERT INTO table (name, age, is_active) VALUES ($1, $2, $3)',
    );
    expect(values).toEqual(['Jhon', 20, true]);
  });

  //
  //

  test('Must save Date as UTC', () => {
    //

    const date = new Date('2024-08-10T00:00:00.000Z');

    const [sql, values] = generateInsertSQL('table', { date }, []);

    expect(sql).toBe('INSERT INTO table (date) VALUES ($1)');

    expect(values).toEqual([date.toISOString()]);
  });

  //
  //

  test('Must generate update', () => {
    //

    const [sql, values] = generateUpdateSQL(
      'table',
      { data: 'data' },
      { id: 1 },
    );

    expect(sql).toBe('UPDATE table SET data = $1 WHERE id = $2;');

    expect(values).toEqual(['data', 1]);
  });

  //
  //

  test('Must throw for update if all fields are undefined', () => {
    //

    expect(() => {
      const [sql, values] = generateUpdateSQL('table', { id: undefined }, {});
    }) //
      .toThrowError('data must have at least one property');
  });

  //
  //

  test('Must throw if there are no where item', () => {
    //

    expect(() => {
      const [sql, values] = generateUpdateSQL('table', { id: 1 }, {});
    }) //
      .toThrowError('where must have at least one property');
  });
});
