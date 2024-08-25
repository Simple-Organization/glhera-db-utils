//
//

/**
 * Object that will be inserted in the database
 */
export interface DBObject {
  [key: string]: any;
}

//
//

/**
 * Convert booleans to 1 or 0
 *
 * Convert objects or arrays to JSON
 *
 * Remove undefined values
 * @param name Name of the object, for debugging
 */
export function dbParse(
  name: string,
  obj: any,
): Record<string, string | number | null> {
  if (typeof obj !== 'object' && obj !== null) {
    throw new Error(name + ' must be an object');
  }

  if (Array.isArray(obj)) {
    throw new Error(name + ' cannot be an array');
  }

  let values = 0;

  const result = Object.keys(obj).reduce((acc, key) => {
    const value = (obj as any)[key];
    if (value === undefined) {
      return acc;
    }

    if (typeof value === 'object' && value !== null) {
      if (value instanceof Date) {
        acc[key] = value.toISOString();
      } else {
        acc[key] = JSON.stringify(value);
      }
    } else {
      acc[key] = value;
    }

    ++values;

    return acc;
  }, {} as any);

  if (values === 0) {
    throw new Error(name + ' must have at least one property');
  }

  return result;
}

/**
 * Generate an insert SQL query
 */
export function generateInsertSQL(
  table: string,
  data: DBObject,
  returning: string[],
): [sql: string, values: (string | number | null)[]] {
  const _data = dbParse('data', data);

  const keys = Object.keys(_data);
  const values = Object.values(_data);

  const placeholders = values.map((_, i) => '$' + (i + 1)).join(', ');
  let sql = `INSERT INTO ${table} (${keys.join(
    ', ',
  )}) VALUES (${placeholders})`;

  if (returning.length) {
    sql += ` RETURNING ${returning.join(', ')}`;
  }

  return [sql, values];
}

// /**
//  * Insert a row in the database
//  */
// export async function insertIntoDB<T = any>(
//   client: pg.Client,
//   table: string,
//   data: DBObject,
//   returning: string[] = [],
// ): Promise<T> {
//   const [sql, values] = generateInsertSQL(table, data, returning);

//   const result = await client.query(sql, values);

//   return result.rows[0] as any;
// }

/**
 * Generate an update SQL query
 */
export function generateUpdateSQL(
  table: string,
  data: DBObject,
  where: DBObject,
): [sql: string, values: (string | number | null)[]] {
  const _data = dbParse('data', data);
  const values = Object.values(_data);
  const dataSQL = Object.keys(_data)
    .map((key) => key + ' = $' + (values.indexOf(_data[key]) + 1))
    .join(', ');

  const _where = dbParse('where', where);
  const whereValues = Object.values(_where);
  const whereSQL = Object.keys(_where)
    .map(
      (key) =>
        key + ' = $' + (values.length + whereValues.indexOf(_where[key]) + 1),
    )
    .join(' AND ');

  const sql = `UPDATE ${table} SET ${dataSQL} WHERE ${whereSQL};`;

  return [sql, [...values, ...whereValues]];
}

// /**
//  * Update a row in the database
//  */
// export function updateDB(
//   client: pg.Client,
//   table: string,
//   data: DBObject,
//   where: DBObject,
// ): Promise<pg.QueryResult<any>> {
//   const [sql, values] = generateUpdateSQL(table, data, where);

//   return client.query(sql, values);
// }
