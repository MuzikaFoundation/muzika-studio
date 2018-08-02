
import { spawn } from 'child_process';
import { waterfall } from 'async';

const commandExists = require('command-exists');

function InstallByBrew(packageName: string): Promise<number> {
  return new Promise<number>((resolve, reject) => {
    commandExists(packageName)
      .then(() => resolve(0))
      .catch(() => {
        spawn('/usr/local/bin/brew', ['install', packageName])
          // resolve after 2 seconds since homebrew in progress error
          .on('close', code => setTimeout(() => resolve(code), 0))
          .stderr.on('data', (data) => console.log(data.toString()));
      });
  });
}


export function InstallMacDependencies(): Promise<void> {
  return Promise.all([
    commandExists('convert'),
    commandExists('gs'),
  ])
    .then(() => {})
    .catch(() => {
      waterfall([
        (callback) => {
          commandExists('brew')
            .then(() => callback())
            .catch(() => {
              spawn(
                '/usr/bin/ruby',
                ['-e', '$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)'])
                .on('close', (code) => callback());
            });
        },
        (callback) => {
          InstallByBrew('ghostscript').then(() => callback());
        },
        (callback) => {
          InstallByBrew('imagemagick').then(() => callback());
        }
      ], () => Promise.resolve());
    });
}
