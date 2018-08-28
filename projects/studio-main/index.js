require('ts-node').register({
  project: __dirname + '/tsconfig.build.json'
});
require('./main.ts');
