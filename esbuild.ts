import * as esbuild from 'esbuild';
import { fixClassNamesPlugin } from 'esbuild-utils';

//
//  Core
//

await esbuild.build({
  entryPoints: ['./src/index.ts'],
  bundle: true,
  outdir: 'dist',
  format: 'esm',
  plugins: [fixClassNamesPlugin()],
});

//
//  Drivers
//

await esbuild.build({
  entryPoints: ['./src/drivers/pg.ts'],
  bundle: true,
  outfile: 'pg/index.js',
  format: 'esm',
  external: ['glhera-db-utils'],
  plugins: [fixClassNamesPlugin()],
});

await esbuild.build({
  entryPoints: ['./src/drivers/pglite.ts'],
  bundle: true,
  outfile: 'pglite/index.js',
  format: 'esm',
  external: ['glhera-db-utils'],
  plugins: [fixClassNamesPlugin()],
});

await esbuild.build({
  entryPoints: ['./src/drivers/better-sqlite3.ts'],
  bundle: true,
  outfile: 'better-sqlite3/index.js',
  format: 'esm',
  external: ['glhera-db-utils'],
  plugins: [fixClassNamesPlugin()],
});
