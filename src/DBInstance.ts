import { insertIntoDB, updateDB } from './crud';
import { DBInstance } from './types';

//
//

/**
 * Creates a new instance of the database and returns an object with various methods for interacting with the database.
 * @param client - The `pg.Client` object used to connect to the database.
 * @returns An object with methods for interacting with the database.
 */
export function createDBInstance(client: pg.Client): DBInstance {
  async function rows<T = any>(sql: string, values?: any[]): Promise<T[]> {
    const result = await client.query(sql, values);
    return result.rows;
  }

  //

  async function single<T = any>(
    sql: string,
    values?: any[],
  ): Promise<T | undefined> {
    const result = await client.query(sql, values);
    if (result.rows.length > 1) {
      throw new Error('More than one row returned');
    }

    return result.rows[0];
  }

  //

  return {
    rows,
    single,
    query: client.query.bind(client),

    insert(table, values, returning = []) {
      const parsed = db_schemas[table].parse(values);

      return insertIntoDB(client, table, parsed, returning as any) as any;
    },

    update(table, data, where) {
      const parsedData = db_update_schemas[table].parse(data);
      const parsedWhere = db_update_schemas[table].parse(where);

      return updateDB(client, table, parsedData, parsedWhere);
    },

    client,
  };
}
