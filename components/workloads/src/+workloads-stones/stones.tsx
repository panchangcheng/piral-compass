import "./stones.scss";

import React from "react";
import {observer} from "mobx-react";
import {RouteComponentProps} from "react-router";
import {Stone, stoneApi} from "compass-base/client/api/endpoints";
import {podsStore} from "../+workloads-pods/pods.store";
import {stoneStore} from "./stones.store";
import {nodesStore} from "compass-base/client/components/+nodes/nodes.store";
import {eventStore} from "compass-base/client/components/+events/event.store";
import {KubeObjectMenu, KubeObjectMenuProps} from "compass-base/client/components/kube-object";
import {KubeObjectListLayout} from "compass-base/client/components/kube-object";
import {IStonesRouteParams} from "../+workloads";
import {apiManager} from "compass-base/client/api/api-manager";
import {enhanceStatefulSetStore} from "../+workloads-enhancestatefulsets/enhancestatefulset.store";
import {MenuItem} from "compass-base/client/components/menu";
import {Icon} from "compass-base/client/components/icon";
import {ConfigStoneDialog} from "./config-stone-dialog";
import {Link} from "react-router-dom";
import Tooltip from "@material-ui/core/Tooltip";
import {stopPropagation} from "compass-base/client/utils";

import {PageComponentProps} from "compass-shell";

enum sortBy {
  name = "name",
  namespace = "namespace",
  pods = "pods",
  statefulSets = "statefulSets",
  strategy = "strategy",
  age = "age",
}

interface Props extends RouteComponentProps<IStonesRouteParams> {
}

@observer
export class Stones extends React.Component<PageComponentProps, any> {

  renderStoneName(stone: Stone) {
    const name = stone.getName();
    return (
      <Link  onClick={(event) => { stopPropagation(event); ConfigStoneDialog.open(stone) }} to={null}>
        <Tooltip title={name} placement="top-start">
          <span>{name}</span>
        </Tooltip>
      </Link>
    );
  }

  getPodsLength(stone: Stone) {
    return stoneStore.getChildPods(stone).length;
  }

  getEnhanceStatefulSetLength(stone: Stone) {
    return stoneStore.getChildEnhanceStatefulset(stone).length;
  }

  hasPodIssues(stone: Stone) {
    return stoneStore.getChildPods(stone).map(pod => {
      return pod.hasIssues()
    }).filter(bool => bool === false).length == 0;
  }

  render() {
    return (
      <>
        <KubeObjectListLayout
          className="Stones" store={stoneStore}
          dependentStores={[podsStore, nodesStore, eventStore, enhanceStatefulSetStore]}
          sortingCallbacks={{
            [sortBy.name]: (stone: Stone) => stone.getName(),
            [sortBy.namespace]: (stone: Stone) => stone.getNs(),
            [sortBy.age]: (stone: Stone) => stone.getAge(false),
            [sortBy.statefulSets]: (stone: Stone) => this.getEnhanceStatefulSetLength(stone),
            [sortBy.strategy]: (stone: Stone) => stone.getStrategy(),
            [sortBy.pods]: (stone: Stone) => this.getPodsLength(stone),
          }}
          searchFilters={[
            (stone: Stone) => stone.getSearchFields(),
          ]}
          renderHeaderTitle={`Stones`}
          renderTableHeader={[
            {title: `Name`, className: "name", sortBy: sortBy.name},
            {className: "warning"},
            {title: `Namespace`, className: "namespace", sortBy: sortBy.namespace},
            {title: `Pods`, className: "pods", sortBy: sortBy.pods},
            {title: `Strategy`, className: "strategy", sortBy: sortBy.strategy},
            {title: `StatefulSets`, className: "statefulSets", sortBy: sortBy.statefulSets},
            {title: `Age`, className: "age", sortBy: sortBy.age},
          ]}
          renderTableContents={(stone: Stone) => [
            this.renderStoneName(stone),
            this.hasPodIssues(stone) && <Icon material="warning" className={"StoneWarningIcon"}/>,
            stone.getNs(),
            this.getPodsLength(stone),
            stone.getStrategy(),
            this.getEnhanceStatefulSetLength(stone),
            stone.getAge(),
          ]}
          renderItemMenu={(item: Stone) => {
            return <StoneMenu object={item}/>
          }}
        />
        <ConfigStoneDialog/>
      </>
    )
  }
}

export function StoneMenu(props: KubeObjectMenuProps<Stone>) {

  const {object, toolbar} = props

  return (
    <KubeObjectMenu {...props} >
      <MenuItem onClick={() => ConfigStoneDialog.open(object)}>
        <Icon material="sync_alt" title={`Config`} interactive={toolbar}/>
        <span className="title">`Config`</span>
      </MenuItem>
    </KubeObjectMenu>
  )
}

apiManager.registerViews(stoneApi, {
  Menu: StoneMenu,
})
