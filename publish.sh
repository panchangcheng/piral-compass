#!/bin/bash

declare -a pilets=("components/workloads", "components/namespace",)

for pilet in "${pilets[@]}";
do
    echo ${pilet};
    cd ${pilet};
    yarn upload;
    rm *.tgz
    cd ..
done
