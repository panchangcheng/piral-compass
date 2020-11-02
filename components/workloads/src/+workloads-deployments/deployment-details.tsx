import "./deployment-details.scss";

import React from "react";
import kebabCase from "lodash/kebabCase";
import { disposeOnUnmount, observer } from "mobx-react";
import { DrawerItem } from "compass-base/client/components/drawer";
import { Badge } from "compass-base/client/components/badge";
import { Deployment, deploymentApi } from "compass-base/client/api/endpoints";
import { cssNames } from "compass-base/client/utils";
import { PodDetailsTolerations } from "../+workloads-pods/pod-details-tolerations";
import { PodDetailsAffinities } from "../+workloads-pods/pod-details-affinities";
import { KubeEventDetails } from "compass-base/client/components/+events/kube-event-details";
import { replicaSetStore } from "../+workloads-replicasets/replicasets.store";
import { podsStore } from "../+workloads-pods/pods.store";
import { KubeObjectDetailsProps } from "compass-base/client/components/kube-object";
import { ResourceMetrics, ResourceMetricsText } from "compass-base/client/components/resource-metrics";
import { deploymentStore } from "./deployments.store";
import { PodCharts, podMetricTabs } from "../+workloads-pods/pod-charts";
import { reaction } from "mobx";
import { PodDetailsList } from "../+workloads-pods/pod-details-list";
import { ReplicaSets } from "../+workloads-replicasets";
import { apiManager } from "compass-base/client/api/api-manager";
import { KubeObjectMeta } from "compass-base/client/components/kube-object/kube-object-meta";

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
        {podsStore.isLoaded && (
          <ResourceMetrics
            loader={() => deploymentStore.loadMetrics(deployment)}
            tabs={podMetricTabs} object={deployment} params={{ metrics }}
          >
            <PodCharts/>
          </ResourceMetrics>
        )}
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
        <ResourceMetricsText metrics={metrics}/>
        <ReplicaSets replicaSets={replicaSets}/>
        <PodDetailsList pods={childPods} owner={deployment}/>
        <KubeEventDetails object={deployment}/>
      </div>
    )
  }
}

apiManager.registerViews(deploymentApi, {
  Details: DeploymentDetails
})