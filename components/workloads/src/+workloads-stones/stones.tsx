import "./stones.scss";

import React from "react";
import {observer} from "mobx-react";
import {RouteComponentProps} from "react-router";
import {Link} from "react-router-dom";
import Tooltip from "@material-ui/core/Tooltip";
import {Stone, stoneApi, apiManager} from "@pskishere/piral-compass-api";
import {MenuItem} from "@pskishere/piral-compass-menu";
import {Icon} from "@pskishere/piral-compass-icon";
import {stopPropagation} from "@pskishere/piral-compass-utils";
import {KubeObjectListLayout, KubeObjectMenu, KubeObjectMenuProps} from "@pskishere/piral-compass-kube-layout";
import {podsStore} from "../+workloads-pods/pods.store";
import {stoneStore} from "./stones.store";
import {nodesStore} from "compass-base/client/components/+nodes/nodes.store";
import {eventStore} from "compass-base/client/components/+events/event.store";
import {IStonesRouteParams} from "../+workloads";
import {enhanceStatefulSetStore} from "../+workloads-enhancestatefulsets/enhancestatefulset.store";

import {ConfigStoneDialog} from "./config-stone-dialog";



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
