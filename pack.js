// console.log();
const fs = require('fs');
const ncc = require('@vercel/ncc');
const { join } = require('path');
ncc(__dirname + '/src/index.ts', {
  // provide a custom cache path or disable caching
  cache: false,
  // externals to leave as requires of the build
  // externals: ["externalpackage"],
  // directory outside of which never to emit assets
  filterAssetBase: process.cwd(), // default
  minify: true, // default
  sourceMap: false, // default
  sourceMapBasePrefix: '../', // default treats sources as output-relative
  // when outputting a sourcemap, automatically include
  // source-map-support in the output file (increases output by 32kB).
  sourceMapRegister: true, // default
  watch: false, // default
  v8cache: false, // default
  quiet: false, // default
  debugLog: false, // default
}).then(async ({ code, map, assets }) => {
  const myDir = join(__dirname, 'dist');
  if (fs.existsSync(myDir) === false) {
    fs.mkdirSync(myDir);
  }
  fs.access(myDir, (err) => {
    if (err && err.code === 'ENOENT') {
      fs.mkdir(myDir); //Create dir in case not found
    }
    fs.writeFile(myDir + '/index.pro.js', code);
  });
  const findProtosJson = join(
    __dirname,
    'node_modules',
    '@google-cloud',
    'firestore',
    'build',
    'protos'
  );
  if (fs.existsSync(findProtosJson)) {
    fs.copyFile(
      join(findProtosJson, 'protos.json'),
      join(myDir, 'protos.json'),
      (err) => {
        if (err) console.error(err);
      }
    );
  }
});

ncc(__dirname + '/websocket_server/index.ts', {
  // provide a custom cache path or disable caching
  cache: false,
  // externals to leave as requires of the build
  // externals: ["externalpackage"],
  // directory outside of which never to emit assets
  filterAssetBase: process.cwd(), // default
  minify: true, // default
  sourceMap: false, // default
  sourceMapBasePrefix: '../', // default treats sources as output-relative
  // when outputting a sourcemap, automatically include
  // source-map-support in the output file (increases output by 32kB).
  sourceMapRegister: true, // default
  watch: false, // default
  v8cache: false, // default
  quiet: false, // default
  debugLog: false, // default
}).then(async ({ code, map, assets }) => {
  const myDir = join(__dirname, 'dist');
  if (fs.existsSync(myDir) === false) {
    fs.mkdirSync(myDir);
  }
  fs.access(myDir, (err) => {
    if (err && err.code === 'ENOENT') {
      fs.mkdir(myDir); //Create dir in case not found
    }
    fs.writeFile(myDir + '/wss.pro.js', code);
  });

  // a.post('http://localhost:3000/update', {
  //   file: code,
  // });
  // Assets is an object of asset file names to { source, permissions, symlinks }
  // expected relative to the output code (if any)
});

ncc(join(__dirname, 'office_server', 'index.ts'), {
  // provide a custom cache path or disable caching
  cache: false,
  // externals to leave as requires of the build
  // externals: ["externalpackage"],
  // directory outside of which never to emit assets
  filterAssetBase: process.cwd(), // default
  minify: true, // default
  sourceMap: false, // default
  sourceMapBasePrefix: '../', // default treats sources as output-relative
  // when outputting a sourcemap, automatically include
  // source-map-support in the output file (increases output by 32kB).
  sourceMapRegister: true, // default
  watch: false, // default
  v8cache: false, // default
  quiet: false, // default
  debugLog: false, // default
}).then(async ({ code, map, assets }) => {
  const myDir = join(__dirname, 'dist');
  if (fs.existsSync(myDir) === false) {
    fs.mkdirSync(myDir);
  }
  fs.access(myDir, (err) => {
    if (err && err.code === 'ENOENT') {
      fs.mkdir(myDir); //Create dir in case not found
    }
    fs.writeFile(join(myDir, 'off_wss.pro.js'), code);
  });

  // a.post('http://localhost:3000/update', {
  //   file: code,
  // });
  // Assets is an object of asset file names to { source, permissions, symlinks }
  // expected relative to the output code (if any)
});
