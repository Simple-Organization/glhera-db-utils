# glhera-db-utils

Biblioteca simples para auxiliar o uso de `Raw SQL`, provendo tipagem para métodos simples de `insert` e `update`, mas essa biblioteca é muito simples, não foi desenvolvida para ser um completo `query builder`, só para `insert` e `update` de uma linha

Possui `wrappers` para `node-postgres`

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

Integrando com alguma biblioteca como o `Zod`

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

Notas que é necessário criar um `dbSchemasUpdate` que seja `partial` para essa operação

## ROADMAP

- `wrappers` para
  - `pglite`
  - `better-sqlite3`
  - `mysql2`
