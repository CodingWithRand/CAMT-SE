const esbuild = require('esbuild');
const isProd = process.env.NODE_ENV === 'production'

esbuild.build({
  entryPoints: ['./src/frontend/main.js', 'node_modules/prismjs/themes/prism.css', 'node_modules/prismjs/themes/prism-tomorrow.css'],
  bundle: true,
  outdir: './public/dist/',
  sourcemap: !isProd,
  mangleProps: isProd ? /_$/ : undefined,
  minify: isProd,
  format: 'iife',
  drop: isProd ? ['console', 'debugger'] : undefined
}).catch((err) => {
  console.error(err);
  process.exit(1);
});
