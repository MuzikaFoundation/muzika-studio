cd ../../

rm -rf dist/studio-main/
mkdir dist/
mkdir dist/studio-main/
cp -rf projects/studio-main/ dist/studio-main/

python dist/studio-main/scripts/build-studio-import-resolver.py

# create core folder in main project
mkdir dist/studio-main/src/core/
cp -rf projects/core/ dist/studio-main/src/core/
rm -rf dist/studio-main/src/core/angular/
rm -rf dist/studio-main/src/core/browser/
rm dist/studio-main/src/core/typings.d.ts

cd dist/studio-main/
rm -rf .cache
electron-compile --appdir `pwd` .
cd ../../

cp -rf dist/studio-main/tsconfig.build.json dist/studio-main/tsconfig.json
