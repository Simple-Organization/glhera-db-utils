import { dts } from 'rollup-plugin-dts';

const config = [
  //
  //  Core
  //

  {
    input: './dist/types/src/index.d.ts',
    output: [{ file: 'dist/index.d.ts', format: 'es' }],
    plugins: [dts()],
  },

  //
  //  Drivers
  //

  {
    input: './dist/types/src/drivers/pg.d.ts',
    output: [{ file: 'pg/index.d.ts', format: 'es' }],
    plugins: [dts()],
  },
  {
    input: './dist/types/src/drivers/pglite.d.ts',
    output: [{ file: 'pglite/index.d.ts', format: 'es' }],
    plugins: [dts()],
  },
  {
    input: './dist/types/src/drivers/better-sqlite3.d.ts',
    output: [{ file: 'better-sqlite3/index.d.ts', format: 'es' }],
    plugins: [dts()],
  },
];

export default config;
