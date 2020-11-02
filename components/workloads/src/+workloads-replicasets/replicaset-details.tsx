import "./replicaset-details.scss";
import React from "react";
import { reaction } from "mobx";
import { DrawerItem } from "compass-base/client/components/drawer";
import { Badge } from "compass-base/client/components/badge";
import { replicaSetStore } from "./replicasets.store";
import { PodDetailsStatuses } from "../+workloads-pods/pod-details-statuses";
import { PodDetailsTolerations } from "../+workloads-pods/pod-details-tolerations";
import { PodDetailsAffinities } from "../+workloads-pods/pod-details-affinities";
import { KubeEventDetails } from "compass-base/client/components/+events/kube-event-details";
import { disposeOnUnmount, observer } from "mobx-react";
import { podsStore } from "../+workloads-pods/pods.store";
import { KubeObjectDetailsProps } from "compass-base/client/components/kube-object";
import { ReplicaSet, replicaSetApi } from "compass-base/client/api/endpoints";
import { ResourceMetrics, ResourceMetricsText } from "compass-base/client/components/resource-metrics";
import { PodCharts, podMetricTabs } from "../+workloads-pods/pod-charts";
import { PodDetailsList } from "../+workloads-pods/pod-details-list";
import { apiManager } from "compass-base/client/api/api-manager";
import { KubeObjectMeta } from "compass-base/client/components/kube-object/kube-object-meta";

interface Props extends KubeObjectDetailsProps<ReplicaSet> {
}

@observer
export class ReplicaSetDetails extends React.Component<Props> {
  @disposeOnUnmount
  clean = reaction(() => this.props.object, () => {
    replicaSetStore.reset();
  });

  async componentDidMount() {
    if (!podsStore.isLoaded) {
      podsStore.loadAll();
    }
  }

  componentWillUnmount() {
    replicaSetStore.reset();
  }

  render() {
    const { object: replicaSet } = this.props
    if (!replicaSet) return null
    const { metrics } = replicaSetStore
    const { status } = replicaSet
    const { availableReplicas, replicas } = status
    const selectors = replicaSet.getSelectors()
    const nodeSelector = replicaSet.getNodeSelectors()
    const images = replicaSet.getImages()
    const childPods = replicaSetStore.getChildPods(replicaSet)
    return (
      <div className="ReplicaSetDetails">
        {podsStore.isLoaded && (
          <ResourceMetrics
            loader={() => replicaSetStore.loadMetrics(replicaSet)}
            tabs={podMetricTabs} object={replicaSet} params={{ metrics }}
          >
            <PodCharts/>
          </ResourceMetrics>
        )}
        <KubeObjectMeta object={replicaSet}/>
        {selectors.length > 0 &&
        <DrawerItem name={`Selector`} labelsOnly>
          {
            selectors.map(label => <Badge key={label} label={label}/>)
          }
        </DrawerItem>
        }
        {nodeSelector.length > 0 &&
        <DrawerItem name={`Node Selector`} labelsOnly>
          {
            nodeSelector.map(label => <Badge key={label} label={label}/>)
          }
        </DrawerItem>
        }
        {images.length > 0 &&
        <DrawerItem name={`Images`}>
          {
            images.map(image => <p key={image}>{image}</p>)
          }
        </DrawerItem>
        }
        <DrawerItem name={`Replicas`}>
          {`${availableReplicas || 0} current / ${replicas || 0} desired`}
        </DrawerItem>
        <PodDetailsTolerations workload={replicaSet}/>
        <PodDetailsAffinities workload={replicaSet}/>
        <DrawerItem name={`Pod Status`} className="pod-status">
          <PodDetailsStatuses pods={childPods}/>
        </DrawerItem>
        <ResourceMetricsText metrics={metrics}/>
        <PodDetailsList pods={childPods} owner={replicaSet}/>
        <KubeEventDetails object={replicaSet}/>
      </div>
    )
  }
}

apiManager.registerViews(replicaSetApi, {
  Details: ReplicaSetDetails,
})