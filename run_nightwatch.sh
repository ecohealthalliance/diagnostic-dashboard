#!/bin//bash

# this was modified from launch_nightwatch_from_app_root.sh
# in the selenium-nightwatch package
echo "installing nightwatch in .meteor/local/build"
  cd .meteor/local/build
  sudo npm install nightwatch@0.5.3
  sudo npm install coffee-script
  sudo npm install mongodb
  cd ../../../

echo "building tests"
  rm -rf tests/built
  mkdir tests/built
  .meteor/local/build/node_modules/coffee-script/bin/coffee -c -o tests/built tests/**/*.coffee

  rm -rf .test_utils/built
  mkdir .test_utils/built
  .meteor/local/build/node_modules/coffee-script/bin/coffee -c -o .test_utils/built .test_utils/*.coffee

echo "running nightwatch from app root"
   sudo .meteor/local/build/node_modules/nightwatch/bin/nightwatch -c nightwatch.json $1 $2
