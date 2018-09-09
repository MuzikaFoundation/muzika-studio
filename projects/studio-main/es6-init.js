const { app } = require('electron');
const { resolve } = require('path');
const isPrebuilt = require('./src/util/process-helper').isPrebuilt;

const readOnlyMode = !isPrebuilt();

if (readOnlyMode) {
  require('electron-compile').init(resolve(__dirname, '..'), resolve(__dirname, './main'));
} else {
  require('./main');
}
