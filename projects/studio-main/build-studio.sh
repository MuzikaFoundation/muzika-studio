cd ../../
rimraf dist/studio-main/
mkdir dist/
mkdir dist/studio-main/
cp -rf projects/studio-main/ dist/studio-main/

# create core folder in main project
mkdir dist/studio-main/core/
cp -rf projects/core/ dist/studio-main/core/

# 여기에서 @muzika/core, @muzika/core/* 경로들을 다 상대경로로 바꿔줌
python dist/studio-main/build-studio-core-replace.py

cd dist/studio-main/
electron-builder build
