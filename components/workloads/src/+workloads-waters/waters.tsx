import "./waters.store.ts";

import React from "react";
import { observer } from "mobx-react";
import { RouteComponentProps } from "react-router";
import { Water, waterApi } from "compass-base/client/api/endpoints";
import { podsStore } from "../+workloads-pods/pods.store";
import { waterStore } from "./waters.store";
import { nodesStore } from "compass-base/client/components/+nodes/nodes.store";
import { eventStore } from "compass-base/client/components/+events/event.store";
import { KubeObjectMenu, KubeObjectMenuProps } from "compass-base/client/components/kube-object/kube-object-menu";
import { KubeObjectListLayout } from "compass-base/client/components/kube-object";
import { IStatefulSetsRouteParams } from "../+workloads";
import { KubeEventIcon } from "compass-base/client/components/+events/kube-event-icon";
import { apiManager } from "compass-base/client/api/api-manager";
import { deploymentStore } from "../+workloads-deployments/deployments.store";

import {PageComponentProps} from "compass-shell";

enum sortBy {
  name = "name",
  namespace = "namespace",
  pods = "pods",
  statefulsets = "statefulsets",
  age = "age",

}

interface Props extends RouteComponentProps<IStatefulSetsRouteParams> {
}

@observer
export class Waters extends React.Component<PageComponentProps, any> {
  getPodsLength(water: Water) {
    return waterStore.getChildPods(water).length;
  }

  // getEnhanceStatefulSetLength(stone: Stone) {
  //   return waterStore.getChildEnhanceStatefulset(stone).length;
  // }


  render() {
    return (
      <KubeObjectListLayout
        className="Waters" store={waterStore}
        dependentStores={[podsStore, nodesStore, eventStore, deploymentStore]}
        sortingCallbacks={{
          [sortBy.name]: (water: Water) => water.getName(),
          [sortBy.namespace]: (water: Water) => water.getNs(),
          [sortBy.age]: (water: Water) => water.getAge(false),
          [sortBy.pods]: (water: Water) => this.getPodsLength(water),
        }}
        searchFilters={[
          (water: Water) => water.getSearchFields(),
        ]}
        renderHeaderTitle={`Waters`}
        renderTableHeader={[
          { title: `Name`, className: "name", sortBy: sortBy.name },
          { title: `Namespace`, className: "namespace", sortBy: sortBy.namespace },
          { title: `Pods`, className: "pods", sortBy: sortBy.pods },
          { className: "warning" },
          // { title: `Statefulsets`, className: "statefulsets", sortBy: sortBy.statefulsets },
          { title: `Age`, className: "age", sortBy: sortBy.age },
        ]}
        renderTableContents={((water: Water) => [
          water.getName(),
          water.getNs(),
          this.getPodsLength(water),
          <KubeEventIcon object={water} />,
          water.getAge(),
        ])}
        renderItemMenu={(item: Water) => {
          return <WaterMenu object={item} />
        }}
      />
    )
  }
}

export function WaterMenu(props: KubeObjectMenuProps<Water>) {
  return (
    <KubeObjectMenu {...props} />
  )
}

apiManager.registerViews(waterApi, {
  Menu: WaterMenu,
})
