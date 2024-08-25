import { generateInsertSQL, generateUpdateSQL } from '../crud';
import type { DBInstance, DBSchemas, ParserValidator } from '../types';
import { Database } from 'better-sqlite3';

//
//

export class BetterSqlite3DBInstance<Schemas extends DBSchemas>
  implements DBInstance<Schemas>
{
  //
  //

  /**
   * Creates a new instance of the database and returns an object with various methods for interacting with the postgres database.
   * @param driver - The `better-sqlite3.Database` object used to connect to the database.
   */
  constructor(
    public driver: Database,
    public insertValidator?: ParserValidator,
    public updateValidator?: ParserValidator,
  ) {}

  //
  //

  async rows<R>(
    sql: string,
    values: (string | number | null)[] = [],
  ): Promise<R[]> {
    return this.driver.prepare<any[], R>(sql).all(...values);
  }

  //
  //

  async single<R>(
    sql: string,
    values: (string | number | null)[] = [],
  ): Promise<R | undefined> {
    return this.driver.prepare<any[], R>(sql).get(...values);
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
      '?',
    );

    const statement = this.driver.prepare(sql);

    if (Array.isArray(returning) && returning.length) {
      return statement.get(...dbValues) as any;
    }

    //
    //

    return statement.run(...dbValues) as any;
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

    const [sql, dbValues] = generateUpdateSQL(
      table as string,
      data,
      where,
      '?',
    );

    console.log(sql, dbValues);

    const result = this.driver.prepare(sql).run(...dbValues);

    return result.changes;
  }
}
