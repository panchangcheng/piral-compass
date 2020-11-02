import * as React from 'react';
import { PiletApi } from 'compass-shell';
import { Namespaces } from './namespaces';
import {SidebarNavItem} from "compass-base/client/components/layout/sidebar";
import {Icon} from "compass-base/client/components/icon";
import {NamespaceSelect} from "./namespace-select";

export function setup(app: PiletApi) {
  app.registerMenu(() =>
    <SidebarNavItem
      id="namespaces"
      url={"/namespaces"}
      icon={<Icon material="layers"/>}
      text={`Namespaces`}
    />
  );
  app.registerPage("/namespaces", Namespaces)
  app.registerExtension('namespace-select', (params) => <NamespaceSelect />)
  app.registerPage("/select", () => (
    <app.Extension name="namespace-select" params={{ onChange: (value) => {console.log(value)} }}/>
  ))
}
