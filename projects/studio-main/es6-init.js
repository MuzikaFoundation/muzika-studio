const { app } = require('electron');
const isPrebuilt = require('./src/util/process-helper').isPrebuilt;

const readOnlyMode = !isPrebuilt();

if (readOnlyMode) {
  require('electron-compile').init(__dirname, './main', true);
} else {
  require('./main');
}
