# piral-compass
micro frontends compass

run compass
```shell script
sudo ./run.sh
sudo ./pubish.sh
cd compass-shell
yarn install
piral debug
```

debug namespace
```
cd compass-shell
yarn install
piral build
cd ../components/namespace
pilet new ../../compass-shell/dist/emulator/compass-shell-1.0.2.tgz --target .
pilet debug
```

debug workloads
```
cd compass-shell
yarn install
piral build
cd ../components/workloads
pilet new ../../compass-shell/dist/emulator/compass-shell-1.0.2.tgz --target .
pilet debug
```