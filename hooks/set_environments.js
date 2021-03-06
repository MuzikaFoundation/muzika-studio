var replace = require("replace");
var fs = require('fs-extra');
var path = require('path');

// use:
var profile = process.env.ENV || 'dev';

console.log('Moving environment configuration ...');
const projectEnvironmentPath = path.resolve(__dirname, '../projects/core/common/environments/');
const targetEnvironmentPath = path.resolve(__dirname,'../projects/studio-main/src/environment.ts');

switch (profile) {
  case 'prod':
    fs.copySync(path.join(projectEnvironmentPath, 'environment.prod.ts'), targetEnvironmentPath);
    break;
  case 'stage':
    fs.copySync(path.join(projectEnvironmentPath, 'environment.stage.ts'), targetEnvironmentPath);
    break;
  default:
    fs.copySync(path.join(projectEnvironmentPath, 'environment.ts'), targetEnvironmentPath);
}

fs.copySync(path.join(projectEnvironmentPath, 'env_types.ts'), targetEnvironmentPath.replace('environment.ts', 'env_types.ts'));

console.log('Current profile : ' + profile);

replace({
  regex: "const environment",
  replacement: "const electronEnvironment",
  paths: [targetEnvironmentPath],
  recursive: true,
  silent: true,
});

for (let environmentType of ["EnvironmentDev", "EnvironmentStage", "EnvironmentProd"]) {
  replace({
    regex: environmentType,
    replacement: "Environment",
    paths: [targetEnvironmentPath],
    recursive: true,
    silent: true,
  });
}
