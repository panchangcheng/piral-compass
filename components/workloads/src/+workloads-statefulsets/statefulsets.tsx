import "./statefulsets.scss";

import React from "react";
import { observer } from "mobx-react";
import { RouteComponentProps } from "react-router";
import { StatefulSet, statefulSetApi } from "compass-base/client/api/endpoints";
import { podsStore } from "../+workloads-pods/pods.store";
import { statefulSetStore } from "./statefulset.store";
import { nodesStore } from "compass-base/client/components/+nodes/nodes.store";
import { eventStore } from "compass-base/client/components/+events/event.store";
import { KubeObjectMenu, KubeObjectMenuProps } from "compass-base/client/components/kube-object/kube-object-menu";
import { KubeObjectListLayout } from "compass-base/client/components/kube-object";
import { IStatefulSetsRouteParams } from "../+workloads";
import { KubeEventIcon } from "compass-base/client/components/+events/kube-event-icon";
import { apiManager } from "compass-base/client/api/api-manager";

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
