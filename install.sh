#!/bin/bash

declare -a pilets=("compass-workloads")

# shellcheck disable=SC2164
cd compass-shell
rm -rf node_modules
rm -f package-lock.json
npm i
yarn install
piral build
cd ..

for pilet in "${pilets[@]}";
do
    echo ${pilet};
    # shellcheck disable=SC2164
    cd ${pilet};
    rm -rf node_modules
    rm -f package-lock.json
    yarn install
    yarn upload
    cd ..
done
