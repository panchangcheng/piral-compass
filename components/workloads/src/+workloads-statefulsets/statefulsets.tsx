import "./statefulsets.scss";

import React from "react";
import { observer } from "mobx-react";
import { RouteComponentProps } from "react-router";
import { StatefulSet, statefulSetApi, apiManager } from "@pskishere/piral-compass-api";
import { KubeObjectListLayout, KubeObjectMenu, KubeObjectMenuProps } from "@pskishere/piral-compass-kube-layout";
import { podsStore } from "../+workloads-pods/pods.store";
import { statefulSetStore } from "./statefulset.store";
import { nodesStore } from "compass-base/client/components/+nodes/nodes.store";
import { eventStore } from "compass-base/client/components/+events/event.store";
import { IStatefulSetsRouteParams } from "../+workloads";
import { KubeEventIcon } from "compass-base/client/components/+events/kube-event-icon";

import {PageComponentProps} from "compass-shell";

enum sortBy {
  name = "name",
  namespace = "namespace",
  pods = "pods",
  age = "age",
}

// interface Props extends RouteComponentProps<IStatefulSetsRouteParams> {
// }


@observer
export class StatefulSets extends React.Component<PageComponentProps, RouteComponentProps> {
  getPodsLength(statefulSet: StatefulSet) {
    return statefulSetStore.getChildPods(statefulSet).length;
  }

  render() {
    return (
      <KubeObjectListLayout
        className="StatefulSets" store={statefulSetStore}
        dependentStores={[podsStore, nodesStore, eventStore]}
        sortingCallbacks={{
          [sortBy.name]: (statefulSet: StatefulSet) => statefulSet.getName(),
          [sortBy.namespace]: (statefulSet: StatefulSet) => statefulSet.getNs(),
          [sortBy.age]: (statefulSet: StatefulSet) => statefulSet.getAge(false),
          [sortBy.pods]: (statefulSet: StatefulSet) => this.getPodsLength(statefulSet),
        }}
        searchFilters={[
          (statefulSet: StatefulSet) => statefulSet.getSearchFields(),
        ]}
        renderHeaderTitle={`Stateful Sets`}
        renderTableHeader={[
          { title: `Name`, className: "name", sortBy: sortBy.name },
          { title: `Namespace`, className: "namespace", sortBy: sortBy.namespace },
          { title: `Pods`, className: "pods", sortBy: sortBy.pods },
          { className: "warning" },
          { title: `Age`, className: "age", sortBy: sortBy.age },
        ]}
        renderTableContents={(statefulSet: StatefulSet) => [
          statefulSet.getName(),
          statefulSet.getNs(),
          this.getPodsLength(statefulSet),
          <KubeEventIcon object={statefulSet}/>,
          statefulSet.getAge(),
        ]}
        renderItemMenu={(item: StatefulSet) => {
          return <StatefulSetMenu object={item}/>
        }}
      />
    )
  }
}

export function StatefulSetMenu(props: KubeObjectMenuProps<StatefulSet>) {
  return (
    <KubeObjectMenu {...props}/>
  )
}

apiManager.registerViews(statefulSetApi, {
  Menu: StatefulSetMenu,
})
