import "./namespaces.scss";

import * as React from "react";
import {observer} from "mobx-react";
import {MenuItem} from "@pskishere/piral-compass-menu";
import {Icon} from "@pskishere/piral-compass-icon";
import {apiManager, Namespace, namespacesApi, NamespaceStatus} from "@pskishere/piral-compass-api";
import {Badge} from "@pskishere/piral-compass-badge";
import {KubeObjectMenu, KubeObjectMenuProps, KubeObjectListLayout} from "@pskishere/piral-compass-kube-layout";
import {AddNamespaceDialog} from "./add-namespace-dialog";
import {namespaceStore} from "./namespace.store";
import {NamespaceNodeRangeLimitDialog} from "./namespace-nodelimit-dialog";
import {NamespaceDetails} from "./namespace-details";
import {PageComponentProps} from "compass-shell";

enum sortBy {
  name = "name",
  labels = "labels",
  age = "age",
  status = "status",
}

@observer
export class Namespaces extends React.Component<PageComponentProps, any> {

  render() {
    return (
      <>
        <KubeObjectListLayout
          isClusterScoped
          className="Namespaces"
          store={namespaceStore}
          sortingCallbacks={{
            [sortBy.name]: (ns: Namespace) => ns.getName(),
            [sortBy.labels]: (ns: Namespace) => ns.getLabels(),
            [sortBy.age]: (ns: Namespace) => ns.getAge(false),
            [sortBy.status]: (ns: Namespace) => ns.getStatus(),
          }}
          searchFilters={[
            (item: Namespace) => item.getSearchFields(),
            (item: Namespace) => item.getStatus()
          ]}
          renderHeaderTitle={`Namespaces`}
          renderTableHeader={[
            {title: `Name`, className: "name", sortBy: sortBy.name},
            {title: `Labels`, className: "labels", sortBy: sortBy.labels},
            {title: `Age`, className: "age", sortBy: sortBy.age},
            {title: `Status`, className: "status", sortBy: sortBy.status},
          ]}
          renderTableContents={(item: Namespace) => [
            item.getName(),
            item.getLabels().map(label => <Badge key={label} label={label}/>),
            item.getAge(),
            {title: item.getStatus(), className: item.getStatus().toLowerCase()},
          ]}
          renderItemMenu={(item: Namespace) => {
            return <NamespaceMenu object={item}/>
          }}
          addRemoveButtons={{
            addTooltip: `Add Namespace`,
            onAdd: () => AddNamespaceDialog.open(),
          }}
          customizeTableRowProps={(item: Namespace) => ({
            disabled: item.getStatus() === NamespaceStatus.TERMINATING,
          })}
        />
        <AddNamespaceDialog/>
        <NamespaceNodeRangeLimitDialog/>
      </>
    )
  }
}

export function NamespaceMenu(props: KubeObjectMenuProps<Namespace>) {
  const {object, toolbar} = props;
  return (
    <KubeObjectMenu {...props} >
      <MenuItem onClick={() => { NamespaceNodeRangeLimitDialog.open(object) }}>
        <Icon material="settings_applications" title={`Allow Node`} interactive={toolbar}/>
        <span className="title">`Allow Node`</span>
      </MenuItem>
    </KubeObjectMenu>
  )
}

apiManager.registerViews(namespacesApi, {Menu: NamespaceMenu});
apiManager.registerStore(namespacesApi, namespaceStore);
apiManager.registerViews(namespacesApi, {Details: NamespaceDetails});