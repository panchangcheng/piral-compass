import "./deployments.scss"

import React from "react";
import {observer} from "mobx-react";
import {RouteComponentProps} from "react-router";
import {Deployment, deploymentApi} from "compass-base/client/api/endpoints";
import {KubeObjectMenu, KubeObjectMenuProps} from "compass-base/client/components/kube-object";
import {MenuItem} from "compass-base/client/components/menu";
import {Icon} from "compass-base/client/components/icon";
import {DeploymentScaleDialog} from "./deployment-scale-dialog";
import {deploymentStore} from "./deployments.store";
import {replicaSetStore} from "../+workloads-replicasets/replicasets.store";
import {podsStore} from "../+workloads-pods/pods.store";
// import {nodesStore} from "compass-base/client/components/+nodes/nodes.store";
// import {eventStore} from "compass-base/client/components/+events/event.store";
import {KubeObjectListLayout} from "compass-base/client/components/kube-object";
import {IDeploymentsRouteParams} from "../+workloads";
import {cssNames, stopPropagation} from "compass-base/client/utils";
import kebabCase from "lodash/kebabCase";
import orderBy from "lodash/orderBy";
import {KubeEventIcon} from "compass-base/client/components/+events/kube-event-icon";
import {apiManager} from "compass-base/client/api/api-manager";
import {Link} from "react-router-dom";
import Tooltip from "@material-ui/core/Tooltip";

import {PageComponentProps} from "compass-shell";

enum sortBy {
  name = "name",
  namespace = "namespace",
  replicas = "replicas",
  age = "age",
  condition = "condition",
}

interface Props extends RouteComponentProps<IDeploymentsRouteParams> {
}

@observer
export class Deployments extends React.Component<PageComponentProps, any> {

  renderDeploymentName(deployment: Deployment) {
    const name = deployment.getName();
    return (
      <Link onClick={(event) => { stopPropagation(event); DeploymentScaleDialog.open(deployment) }} to={null}>
        <Tooltip title={name} placement="top-start">
          <span>{name}</span>
        </Tooltip>
      </Link>
    );
  }

  renderPods(deployment: Deployment) {
    const {replicas, availableReplicas} = deployment.status
    return `${availableReplicas || 0}/${replicas || 0}`
  }

  renderConditions(deployment: Deployment) {
    const conditions = orderBy(deployment.getConditions(true), "type", "asc")
    return conditions.map(({type, message}) => (
      <span key={type} className={cssNames("condition", kebabCase(type))} title={message}>
        {type}
      </span>
    ))
  }

  render() {
    return (
      <>
        <KubeObjectListLayout
          className="Deployments" store={deploymentStore}
          dependentStores={[replicaSetStore, podsStore, nodesStore, eventStore]}
          sortingCallbacks={{
            [sortBy.name]: (deployment: Deployment) => deployment.getName(),
            [sortBy.namespace]: (deployment: Deployment) => deployment.getNs(),
            [sortBy.replicas]: (deployment: Deployment) => deployment.getReplicas(),
            [sortBy.age]: (deployment: Deployment) => deployment.getAge(false),
            [sortBy.condition]: (deployment: Deployment) => deployment.getConditionsText(),
          }}
          searchFilters={[
            (deployment: Deployment) => deployment.getSearchFields(),
            (deployment: Deployment) => deployment.getConditionsText(),
          ]}
          renderHeaderTitle={`Deployments`}
          renderTableHeader={[
            {title: `Name`, className: "name", sortBy: sortBy.name},
            {title: `Namespace`, className: "namespace", sortBy: sortBy.namespace},
            {title: `Pods`, className: "pods"},
            {title: `Replicas`, className: "replicas", sortBy: sortBy.replicas},
            {className: "warning"},
            {title: `Age`, className: "age", sortBy: sortBy.age},
            {title: `Conditions`, className: "conditions", sortBy: sortBy.condition},
          ]}
          renderTableContents={(deployment: Deployment) => [
            this.renderDeploymentName(deployment),
            deployment.getNs(),
            this.renderPods(deployment),
            deployment.getReplicas(),
            <KubeEventIcon object={deployment}/>,
            deployment.getAge(),
            this.renderConditions(deployment),
          ]}
          renderItemMenu={(item: Deployment) => {
            return <DeploymentMenu object={item}/>
          }}
        />
        <DeploymentScaleDialog />
      </>
    )
  }
}

export function DeploymentMenu(props: KubeObjectMenuProps<Deployment>) {
  const {object, toolbar} = props;
  return (
    <KubeObjectMenu {...props}>
      <MenuItem onClick={() => DeploymentScaleDialog.open(object)}>
        <Icon material="control_camera" title={`Scale`} interactive={toolbar}/>
        <span className="title">`Scale`</span>
      </MenuItem>
    </KubeObjectMenu>
  )
}

apiManager.registerViews(deploymentApi, {
  Menu: DeploymentMenu,
});