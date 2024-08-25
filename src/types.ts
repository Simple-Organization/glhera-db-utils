//
//

export interface IDBClient {
  //
  query: (sql: string, values?: any[]) => Promise<any[]>;
}

//
//

type TypeofDBSchemas = typeof db_schemas;

//
//

/**
 * Represents a database instance.
 */
export interface DBInstance {
  /**
   * Executes a SQL query and returns the result as an array of rows.
   * @param sql - The SQL query to execute.
   * @param values - Optional values to be used in the query.
   * @returns A promise that resolves to an array of rows.
   */
  rows<T = any>(sql: string, values?: any[]): Promise<T[]>;

  /**
   * Executes a SQL query and returns a single row.
   * @param sql - The SQL query to execute.
   * @param values - Optional values to be used in the query.
   * @returns A promise that resolves to a single row or undefined if no row is found.
   */
  single<T = any>(sql: string, values?: any[]): Promise<T | undefined>;

  /**
   * Executes a SQL query using the underlying `pg.Client` object.
   * @param sql - The SQL query to execute.
   * @param values - Optional values to be used in the query.
   * @returns A promise that resolves to the result of the query.
   */
  query: pg.Client['query'];

  /**
   * Inserts a new row into the specified table and returns the inserted row.
   * @param table - The name of the table to insert into.
   * @param values - An object representing the values to be inserted.
   * @param returning - Optional array of column names to return from the inserted row.
   * @returns A promise that resolves to the inserted row.
   */
  insert<
    K extends keyof TypeofDBSchemas,
    T extends Infer<TypeofDBSchemas[K]>,
    I extends keyof Infer<TypeofDBSchemas[K]>,
    G extends Pick<Infer<TypeofDBSchemas[K]>, I>,
  >(
    table: K,
    values: T,
    returning?: readonly I[],
  ): Promise<G>;

  /**
   * Updates rows in the specified table based on the provided conditions and returns the result of the update operation.
   * @param table - The name of the table to update.
   * @param data - An object representing the values to be updated.
   * @param where - An object representing the conditions for the update operation.
   * @returns A promise that resolves to the result of the update operation.
   */
  update<
    K extends keyof TypeofDBSchemas,
    T extends Partial<Infer<TypeofDBSchemas[K]>>,
  >(
    table: K,
    data: T,
    where: T,
  ): Promise<pg.QueryResult<any>>;
}
