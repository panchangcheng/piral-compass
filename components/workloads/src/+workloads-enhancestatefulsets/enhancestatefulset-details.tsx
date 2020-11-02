import "./enhancestatefulset-details.scss";

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
import { enhanceStatefulSetStore } from "./enhancestatefulset.store";
import { KubeObjectDetailsProps } from "compass-base/client/components/kube-object";
import { EnhanceStatefulSet, enhanceStatefulSetApi } from "compass-base/client/api/endpoints";
import { ResourceMetrics, ResourceMetricsText } from "compass-base/client/components/resource-metrics";
import { PodCharts, podMetricTabs } from "../+workloads-pods/pod-charts";
import { PodDetailsList } from "../+workloads-pods/pod-details-list";
import { apiManager } from "compass-base/client/api/api-manager";
import { KubeObjectMeta } from "compass-base/client/components/kube-object/kube-object-meta";

interface Props extends KubeObjectDetailsProps<EnhanceStatefulSet> {
}

@observer
export class EnhanceStatefulSetDetails extends React.Component<Props> {
  @disposeOnUnmount
  clean = reaction(() => this.props.object, () => {
    enhanceStatefulSetStore.reset();
  });

  componentDidMount() {
    if (!podsStore.isLoaded) {
      podsStore.loadAll();
    }
  }

  componentWillUnmount() {
    enhanceStatefulSetStore.reset();
  }

  render() {
    const { object: enhanceStatefulset } = this.props;
    if (!enhanceStatefulset) return null
    const images = enhanceStatefulset.getImages()
    const selectors = enhanceStatefulset.getSelectors()
    const nodeSelector = enhanceStatefulset.getNodeSelectors()
    const childPods = enhanceStatefulSetStore.getChildPods(enhanceStatefulset)
    const metrics = enhanceStatefulSetStore.metrics
    
    return (
      <div className="EnhanceStatefulSetDetails">
        {podsStore.isLoaded && (
          <ResourceMetrics
            loader={() => enhanceStatefulSetStore.loadMetrics(enhanceStatefulset)}
            tabs={podMetricTabs} object={enhanceStatefulset} params={{ metrics }}
          >
            <PodCharts/>
          </ResourceMetrics>
        )}
        <KubeObjectMeta object={enhanceStatefulset}/>
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
        
        <PodDetailsTolerations workload={enhanceStatefulset}/>
        <PodDetailsAffinities workload={enhanceStatefulset}/>

        <DrawerItem name={`Pod Status`} className="pod-status">
          <PodDetailsStatuses pods={childPods}/>
        </DrawerItem>
        <ResourceMetricsText metrics={metrics}/>
        <PodDetailsList pods={childPods} owner={enhanceStatefulset}/>
        <KubeEventDetails object={enhanceStatefulset}/>
      </div>
    )
  }
}

apiManager.registerViews(enhanceStatefulSetApi, {
  Details: EnhanceStatefulSetDetails
})