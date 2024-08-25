# glhera-db-utils

Biblioteca simples para auxiliar o uso de `Raw SQL`, provendo tipagem para métodos simples de `insert` e `update`, mas essa biblioteca é muito simples, não foi desenvolvida para ser um completo `query builder`, só para `insert` e `update` de uma linha

Possui `wrappers` para `node-postgres` (pg), `@electric-sql/pglite` (pglite) e `better-sqlite3`

## Exemplo

```ts
import { PGDBInstance } from 'glhera-db-utils/pg';
import { pg } from 'pg';

//
// A tipagem do banco
type DBTypes = {
  users: {
    id: number;
    name: string;
  };
};

//
// Cria o driver de acesso do postgres
const client = new pg.Client({ connectionString });
await client.connect();

//
// Cria a instancia para acesso
const pgDB = new PGDBInstance<DBTypes>(client);

//
// Acessando o client no pgDB
console.log(pgDB.driver);
```

## Banco de dados suportados no momento

```ts
import { PGDBInstance } from 'glhera-db-utils/pg';
import { PGLiteDBInstance } from 'glhera-db-utils/pglite';
import { BetterSqlite3DBInstance } from 'glhera-db-utils/better-sqlite3';
```

## Integrando com alguma biblioteca como o `Zod`

```ts
import { PGDBInstance } from 'glhera-db-utils/pg';
import { pg } from 'pg';
import { z } from 'zod';

//
// A tipagem do banco
const dbSchemas = {
  users: z.object({
    id: z.number(),
    name: z.string(),
  }),
};

//
// Cria o driver de acesso do postgres
const client = new pg.Client({ connectionString });
await client.connect();

//
// Tipo utilitário para inferir a tipagem de um objeto Zod
type InferTypes<T extends Record<string, z.ZodType<any, any, any>>> = {
  [K in keyof T]: z.infer<T[K]>;
};

//
// Cria a instancia para acesso
const pgDB = new PGDBInstance<InferTypes<typeof dbSchemas>>(client);
```

E com o exemplo abaixo, podemos validar com o `Zod` (pode ser outro como o `yup`) o nosso campo antes de salvá-lo, útil para campos `json` ou salvar no `SQLite`

```ts
const dbSchemasInsert = {
  users: z.object({
    id: z.number(),
    name: z.string(),
  }),
};

const dbSchemasUpdate = {
  users: dbSchemasInsert.users.partial(),
};

const pgDB = new PGDBInstance<InferTypes<typeof dbSchemasInsert>>(
  client,
  (table, values) => (dbSchemasInsert as any)[table].parse(values), // Insert, unfortunately typing here does not work well
  (table, values) => (dbSchemasUpdate as any)[table].parse(values), // Update, unfortunately typing here does not work well
);
```

### Notas

> É necessário criar um `dbSchemasUpdate` que seja `partial` para essa operação

> A tipagem para o `Zod` (ou outra lib) para insert é que o `id` se é autoincrements precisa ser `.nullish()` para que o TypeScript não fique reclamando em cada insert por não inserir o `id`

## ROADMAP

- `wrappers` para
  - `mysql2`

## Tests

Para poder testar essa aplicação, é necessário definir as variáveis de ambiente para o `postgres`

```env
PG_USER=
PG_PASSWORD=
PG_HOST=
PG_DATABASE=
```
