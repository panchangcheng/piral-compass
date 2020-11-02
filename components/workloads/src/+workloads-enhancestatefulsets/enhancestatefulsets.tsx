import "./enhancestatefulsets.scss";

import React from "react";
import { observer } from "mobx-react";
import { RouteComponentProps } from "react-router";
import { EnhanceStatefulSet, enhanceStatefulSetApi } from "compass-base/client/api/endpoints";
import { podsStore } from "../+workloads-pods/pods.store";
import { enhanceStatefulSetStore } from "./enhancestatefulset.store";
import { nodesStore } from "compass-base/client/components/+nodes/nodes.store";
import { eventStore } from "compass-base/client/components/+events/event.store";
import { KubeObjectMenu, KubeObjectMenuProps } from "compass-base/client/components/kube-object/kube-object-menu";
import { KubeObjectListLayout } from "compass-base/client/components/kube-object";
import { IEnhanceStatefulSetsRouteParams } from "../+workloads";
import { KubeEventIcon } from "compass-base/client/components/+events/kube-event-icon";
import { apiManager } from "compass-base/client/api/api-manager";
import {PageComponentProps} from "compass-shell";

enum sortBy {
  name = "name",
  namespace = "namespace",
  pods = "pods",
  age = "age",
}

// interface Props extends RouteComponentProps<IEnhanceStatefulSetsRouteParams> {
// }

interface Props extends PageComponentProps {

}

@observer
export class EnhanceStatefulSets extends React.Component<PageComponentProps, any> {
  getPodsLength(statefulSet: EnhanceStatefulSet) {
    return enhanceStatefulSetStore.getChildPods(statefulSet).length;
  }

  render() {
    return (
      <KubeObjectListLayout
        className="EnhanceStatefulSets"
        store={enhanceStatefulSetStore}
        dependentStores={[podsStore, nodesStore, eventStore]}
        sortingCallbacks={{
          [sortBy.name]: (statefulSet: EnhanceStatefulSet) => statefulSet.getName(),
          [sortBy.namespace]: (statefulSet: EnhanceStatefulSet) => statefulSet.getNs(),
          [sortBy.age]: (statefulSet: EnhanceStatefulSet) => statefulSet.getAge(false),
          [sortBy.pods]: (statefulSet: EnhanceStatefulSet) => this.getPodsLength(statefulSet),
        }}
        searchFilters={[
          (statefulSet: EnhanceStatefulSet) => statefulSet.getSearchFields(),
        ]}
        renderHeaderTitle={`Stateful Sets`}
        renderTableHeader={[
          { title: `Name`, className: "name", sortBy: sortBy.name },
          { title: `Namespace`, className: "namespace", sortBy: sortBy.namespace },
          { title: `Pods`, className: "pods", sortBy: sortBy.pods },
          { className: "warning" },
          { title: `Age`, className: "age", sortBy: sortBy.age },
        ]}
        renderTableContents={(statefulSet: EnhanceStatefulSet) => [
          statefulSet.getName(),
          statefulSet.getNs(),
          this.getPodsLength(statefulSet),
          <KubeEventIcon object={statefulSet} />,
          statefulSet.getAge(),
        ]}
        renderItemMenu={(item: EnhanceStatefulSet) => {
          return <EnhanceStatefulSetMenu object={item} />
        }}
      />
    )
  }
}

export function EnhanceStatefulSetMenu(props: KubeObjectMenuProps<EnhanceStatefulSet>) {
  return (
    <KubeObjectMenu {...props} />
  )
}

apiManager.registerViews(enhanceStatefulSetApi, {
  Menu: EnhanceStatefulSetMenu,
})
