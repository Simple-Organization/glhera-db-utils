//
//

export type DBSchemas = Record<string, Record<string, any>>;

//
//

export type ParserValidator = (table: string, values: unknown) => unknown;

//
//

export interface IDBClient {
  /**
   * Executes a SQL query and returns the result as an array of rows.
   * @param sql - The SQL query to execute.
   * @param values - Optional values to be used in the query.
   * @returns A promise that resolves to an array of rows.
   */
  rows: <R>(
    sql: string,
    values?: (string | number | null)[] | undefined,
  ) => Promise<R[]>;

  /**
   * Executes a SQL query and returns a single row.
   *
   * May throw an error if multiple rows are returned depending on the implemetation.
   * @param sql - The SQL query to execute.
   * @param values - Optional values to be used in the query.
   * @returns A promise that resolves to a single row or undefined if no row is found.
   */
  single: <R>(
    sql: string,
    values?: (string | number | null)[] | undefined,
  ) => Promise<R>;
}

//
//

/**
 * Represents a database instance.
 */
export interface DBInstance<Schemas extends DBSchemas> extends IDBClient {
  /**
   * Inserts a new row into the specified table and returns the inserted row.
   * @param table - The name of the table to insert into.
   * @param values - An object representing the values to be inserted.
   * @param returning - Optional array of column names to return from the inserted row.
   * @returns A promise that resolves to the inserted row.
   */
  insert<
    K extends keyof Schemas,
    V extends Schemas[K],
    R extends keyof Schemas[K],
    G extends Pick<Schemas[K], R>,
  >(
    table: K,
    values: V,
    returning?: readonly R[],
  ): Promise<G>;

  /**
   * Updates rows in the specified table based on the provided conditions and returns the result of the update operation.
   * @param table - The name of the table to update.
   * @param data - An object representing the values to be updated.
   * @param where - An object representing the conditions for the update operation.
   * @returns A promise that resolves to the result of the update operation.
   */
  update<
    K extends keyof Schemas,
    D extends Partial<Schemas[K]>,
    W extends Partial<Schemas[K]>,
  >(
    table: K,
    data: D,
    where: W,
  ): Promise<number | null>;
}
