import "./statefulset-details.scss";

import React from "react";
import { disposeOnUnmount, observer } from "mobx-react";
import { reaction } from "mobx";
import { Badge } from "compass-base/client/components/badge";
import { DrawerItem } from "compass-base/client/components/drawer";
import { PodDetailsStatuses } from "../+workloads-pods/pod-details-statuses";
import { PodDetailsTolerations } from "../+workloads-pods/pod-details-tolerations";
import { PodDetailsAffinities } from "../+workloads-pods/pod-details-affinities";
import { KubeEventDetails } from "compass-base/client/components/+events/kube-event-details";
import { podsStore } from "../+workloads-pods/pods.store";
import { statefulSetStore } from "./statefulset.store";
import { KubeObjectDetailsProps } from "compass-base/client/components/kube-object";
import { StatefulSet, statefulSetApi } from "compass-base/client/api/endpoints";
import { ResourceMetrics, ResourceMetricsText } from "compass-base/client/components/resource-metrics";
import { PodCharts, podMetricTabs } from "../+workloads-pods/pod-charts";
import { PodDetailsList } from "../+workloads-pods/pod-details-list";
import { apiManager } from "compass-base/client/api/api-manager";
import { KubeObjectMeta } from "compass-base/client/components/kube-object/kube-object-meta";

interface Props extends KubeObjectDetailsProps<StatefulSet> {
}

@observer
export class StatefulSetDetails extends React.Component<Props> {
  @disposeOnUnmount
  clean = reaction(() => this.props.object, () => {
    statefulSetStore.reset();
  });

  componentDidMount() {
    if (!podsStore.isLoaded) {
      podsStore.loadAll();
    }
  }

  componentWillUnmount() {
    statefulSetStore.reset();
  }

  render() {
    const { object: statefulSet } = this.props;
    if (!statefulSet) return null
    const images = statefulSet.getImages()
    const selectors = statefulSet.getSelectors()
    const nodeSelector = statefulSet.getNodeSelectors()
    const childPods = statefulSetStore.getChildPods(statefulSet)
    const metrics = statefulSetStore.metrics
    return (
      <div className="StatefulSetDetails">
        {podsStore.isLoaded && (
          <ResourceMetrics
            loader={() => statefulSetStore.loadMetrics(statefulSet)}
            tabs={podMetricTabs} object={statefulSet} params={{ metrics }}
          >
            <PodCharts/>
          </ResourceMetrics>
        )}
        <KubeObjectMeta object={statefulSet}/>
        {selectors.length &&
        <DrawerItem name={`Selector`} labelsOnly>
          {
            selectors.map(label => <Badge key={label} label={label}/>)
          }
        </DrawerItem>
        }
        {nodeSelector.length > 0 &&
        <DrawerItem name={`Node Selector`} labelsOnly>
          {
            nodeSelector.map(label => (
              <Badge key={label} label={label}/>
            ))
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
        <PodDetailsTolerations workload={statefulSet}/>
        <PodDetailsAffinities workload={statefulSet}/>
        <DrawerItem name={`Pod Status`} className="pod-status">
          <PodDetailsStatuses pods={childPods}/>
        </DrawerItem>
        <ResourceMetricsText metrics={metrics}/>
        <PodDetailsList pods={childPods} owner={statefulSet}/>
        <KubeEventDetails object={statefulSet}/>
      </div>
    )
  }
}

apiManager.registerViews(statefulSetApi, {
  Details: StatefulSetDetails
})