import {
  generateInsertSQL,
  generateUpdateSQL,
  type DBInstance,
  type DBSchemas,
  type ParserValidator,
} from 'glhera-db-utils';
import { PGlite } from '@electric-sql/pglite';

//
//

export class PGLiteDBInstance<Schemas extends DBSchemas>
  implements DBInstance<Schemas>
{
  //
  //

  /**
   * Creates a new instance of the database and returns an object with various methods for interacting with the postgres database.
   * @param driver - The `PGlite` object used to connect to the database.
   */
  constructor(
    public driver: PGlite,
    public insertValidator?: ParserValidator,
    public updateValidator?: ParserValidator,
  ) {}

  //
  //

  async rows<R>(
    sql: string,
    values?: (string | number | null)[] | undefined,
  ): Promise<R[]> {
    const result = await this.driver.query(sql, values);

    return result.rows as any;
  }

  //
  //

  async single<R>(
    sql: string,
    values?: (string | number | null)[] | undefined,
  ): Promise<R | undefined> {
    const result = await this.driver.query<R>(sql, values);

    if (result.rows.length > 1) {
      throw new Error('More than one row returned');
    }

    return result.rows[0];
  }

  //
  //

  async run(
    sql: string,
    values?: (string | number | null)[] | undefined,
  ): Promise<number | null> {
    const result = await this.driver.query(sql, values);
    return result.affectedRows!;
  }

  //
  //

  async insert<
    K extends keyof Schemas,
    T extends Schemas[K],
    I extends keyof Schemas[K],
    G extends Pick<Schemas[K], I>,
  >(table: K, values: T, returning?: readonly I[] | undefined): Promise<G> {
    let parsed: any;

    if (!this.insertValidator) {
      parsed = values;
    } else {
      parsed = this.insertValidator(table as any, values);
    }

    //
    //

    const [sql, dbValues] = generateInsertSQL(
      table as string,
      parsed,
      returning as any,
    );

    const result = await this.driver.query(sql, dbValues);

    //
    //

    return result.rows[0] as any;
  }

  //
  //

  async update<
    K extends keyof Schemas,
    D extends Partial<Schemas[K]>,
    W extends Partial<Schemas[K]>,
  >(table: K, data: D, where: W): Promise<number | null> {
    let parsedData: any;
    let parsedWhere: any;

    if (!this.updateValidator) {
      parsedData = data;
      parsedWhere = where;
    } else {
      parsedData = this.updateValidator(table as any, data);
      parsedWhere = this.updateValidator(table as any, where);
    }

    const [sql, dbValues] = generateUpdateSQL(table as string, data, where);

    const result = await this.driver.query(sql, dbValues);

    return result.affectedRows ?? null;
  }
}
