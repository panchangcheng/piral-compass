import "./deployment-details.scss";

import React from "react";
import { reaction } from "mobx";
import kebabCase from "lodash/kebabCase";
import { disposeOnUnmount, observer } from "mobx-react";
import { DrawerItem } from "@pskishere/piral-compass-drawer";
import { Badge } from "@pskishere/piral-compass-badge";
import { Deployment, deploymentApi, apiManager } from "@pskishere/piral-compass-api";
import { cssNames } from "@pskishere/piral-compass-utils";
import { PodDetailsTolerations } from "../+workloads-pods/pod-details-tolerations";
import { PodDetailsAffinities } from "../+workloads-pods/pod-details-affinities";
// import { KubeEventDetails } from "compass-base/client/components/+events/kube-event-details";
import { replicaSetStore } from "../+workloads-replicasets/replicasets.store";
import { podsStore } from "../+workloads-pods/pods.store";
import { KubeObjectDetailsProps, KubeObjectMeta } from "@pskishere/piral-compass-kube-layout";
// import { ResourceMetrics, ResourceMetricsText } from "compass-base/client/components/resource-metrics";
import { deploymentStore } from "./deployments.store";
import { PodCharts, podMetricTabs } from "../+workloads-pods/pod-charts";
import { PodDetailsList } from "../+workloads-pods/pod-details-list";
import { ReplicaSets } from "../+workloads-replicasets";

interface Props extends KubeObjectDetailsProps<Deployment> {
}

@observer
export class DeploymentDetails extends React.Component<Props> {
  @disposeOnUnmount
  clean = reaction(() => this.props.object, () => {
    deploymentStore.reset();
  });

  componentDidMount() {
    if (!podsStore.isLoaded) {
      podsStore.loadAll();
    }
    // if (!replicaSetStore.isLoaded) {
    //   replicaSetStore.loadAll();
    // }
  }

  componentWillUnmount() {
    deploymentStore.reset();
  }

  render() {
    const { object: deployment } = this.props;
    if (!deployment) return null
    const { status, spec } = deployment
    const nodeSelector = deployment.getNodeSelectors()
    const selectors = deployment.getSelectors();
    const childPods = deploymentStore.getChildPods(deployment)
    const replicaSets = replicaSetStore.getReplicaSetsByOwner(deployment)
    const metrics = deploymentStore.metrics
    return (
      <div className="DeploymentDetails">
        {/* {podsStore.isLoaded && (
          <ResourceMetrics
            loader={() => deploymentStore.loadMetrics(deployment)}
            tabs={podMetricTabs} object={deployment} params={{ metrics }}
          >
            <PodCharts/>
          </ResourceMetrics>
        )} */}
        <KubeObjectMeta object={deployment}/>
        <DrawerItem name={`Replicas`}>
          {`${spec.replicas} desired, ${status.updatedReplicas || 0} updated`},{" "}
          {`${status.replicas || 0} total, ${status.availableReplicas || 0} available`},{" "}
          {`${status.unavailableReplicas || 0} unavailable`}
        </DrawerItem>
        {selectors.length > 0 &&
        <DrawerItem name={`Selector`} labelsOnly>
          {
            selectors.map(label => <Badge key={label} label={label}/>)
          }
        </DrawerItem>
        }
        {nodeSelector.length > 0 &&
        <DrawerItem name={`Node Selector`}>
          {
            nodeSelector.map(label => (
              <Badge key={label} label={label}/>
            ))
          }
        </DrawerItem>
        }
        <DrawerItem name={`Strategy Type`}>
          {spec.strategy.type}
        </DrawerItem>
        <DrawerItem name={`Conditions`} className="conditions" labelsOnly>
          {
            deployment.getConditions().map(condition => {
              const { type, message, lastTransitionTime, status } = condition
              return (
                <Badge
                  key={type}
                  label={type}
                  className={cssNames({ disabled: status === "False" }, kebabCase(type))}
                  tooltip={(
                    <>
                      <p>{message}</p>
                      <p>`Last transition time: {lastTransitionTime}`</p>
                    </>
                  )}
                />
              );
            })
          }
        </DrawerItem>
        <PodDetailsTolerations workload={deployment}/>
        <PodDetailsAffinities workload={deployment}/>
        {/* <ResourceMetricsText metrics={metrics}/> */}
        <ReplicaSets replicaSets={replicaSets}/>
        <PodDetailsList pods={childPods} owner={deployment}/>
        {/* <KubeEventDetails object={deployment}/> */}
      </div>
    )
  }
}

apiManager.registerViews(deploymentApi, {
  Details: DeploymentDetails
})