import "./daemonsets.scss";

import React from "react";
import { observer } from "mobx-react";
import { RouteComponentProps } from "react-router";
import { DaemonSet, daemonSetApi, apiManager } from "@pskishere/piral-compass-api";
import { Badge } from "@pskishere/piral-compass-badge";
import { KubeObjectListLayout, KubeObjectMenu, KubeObjectMenuProps } from "@pskishere/piral-compass-kube-layout";
import { daemonSetStore } from "./daemonsets.store";
import { podsStore } from "../+workloads-pods/pods.store";
import { IDaemonSetsRouteParams } from "../+workloads";
// import { eventStore } from "compass-base/client/components/+events/event.store";
// import { nodesStore } from "compass-base/client/components/+nodes/nodes.store";
// import { KubeEventIcon } from "compass-base/client/components/+events/kube-event-icon";

import { PageComponentProps } from "compass-shell";

enum sortBy {
  name = "name",
  namespace = "namespace",
  pods = "pods",
  age = "age",
}

interface Props extends RouteComponentProps<IDaemonSetsRouteParams> {
}

@observer
export class DaemonSets extends React.Component<PageComponentProps, any> {
  getPodsLength(daemonSet: DaemonSet) {
    return daemonSetStore.getChildPods(daemonSet).length;
  }

  renderNodeSelector(daemonSet: DaemonSet) {
    return daemonSet.getNodeSelectors().map(selector => (
      <Badge key={selector} label={selector}/>
    ))
  }

  render() {
    return (
      <KubeObjectListLayout
        className="DaemonSets" 
        store={daemonSetStore}
        dependentStores={[podsStore, ]}
        sortingCallbacks={{
          [sortBy.name]: (daemonSet: DaemonSet) => daemonSet.getName(),
          [sortBy.namespace]: (daemonSet: DaemonSet) => daemonSet.getNs(),
          [sortBy.pods]: (daemonSet: DaemonSet) => this.getPodsLength(daemonSet),
          [sortBy.age]: (daemonSet: DaemonSet) => daemonSet.getAge(false),
        }}
        searchFilters={[
          (daemonSet: DaemonSet) => daemonSet.getSearchFields(),
          (daemonSet: DaemonSet) => daemonSet.getLabels(),
        ]}
        renderHeaderTitle={`Daemon Sets`}
        renderTableHeader={[
          { title: `Name`, className: "name", sortBy: sortBy.name },
          { title: `Namespace`, className: "namespace", sortBy: sortBy.namespace },
          { title: `Pods`, className: "pods", sortBy: sortBy.pods },
          // { className: "warning" },
          { title: `Node Selector`, className: "labels" },
          { title: `Age`, className: "age", sortBy: sortBy.age },
        ]}
        renderTableContents={(daemonSet: DaemonSet) => [
          daemonSet.getName(),
          daemonSet.getNs(),
          this.getPodsLength(daemonSet),
          // <KubeEventIcon object={daemonSet}/>,
          this.renderNodeSelector(daemonSet),
          daemonSet.getAge(),
        ]}
        renderItemMenu={(item: DaemonSet) => {
          return <DaemonSetMenu object={item}/>
        }}
      />
    )
  }
}

export function DaemonSetMenu(props: KubeObjectMenuProps<DaemonSet>) {
  return (
    <KubeObjectMenu {...props}/>
  )
}

apiManager.registerViews(daemonSetApi, {
  Menu: DaemonSetMenu,
})