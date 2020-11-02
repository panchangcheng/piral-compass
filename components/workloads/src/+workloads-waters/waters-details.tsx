import "./waters-details.scss";

import React from "react";
import { disposeOnUnmount, observer } from "mobx-react";
import { reaction } from "mobx";
import { Badge } from "compass-base/client/components/badge";
import { DrawerItem } from "compass-base/client/components/drawer";
import { PodDetailsStatuses } from "../+workloads-pods/pod-details-statuses";
import { KubeEventDetails } from "compass-base/client/components/+events/kube-event-details";
import { podsStore } from "../+workloads-pods/pods.store";
import { waterStore } from "./waters.store";
import { KubeObjectDetailsProps } from "compass-base/client/components/kube-object";
import { Water, waterApi } from "compass-base/client/api/endpoints";
import { ResourceMetrics, ResourceMetricsText } from "compass-base/client/components/resource-metrics";
import { PodCharts, podMetricTabs } from "../+workloads-pods/pod-charts";
import { PodDetailsList } from "../+workloads-pods/pod-details-list";
import { apiManager } from "compass-base/client/api/api-manager";
import { KubeObjectMeta } from "compass-base/client/components/kube-object/kube-object-meta";

interface Props extends KubeObjectDetailsProps<Water> {
}

@observer
export class WaterDetails extends React.Component<Props> {
  @disposeOnUnmount
  clean = reaction(() => this.props.object, () => {
    waterStore.reset();
  });

  componentDidMount() {
    if (!podsStore.isLoaded) {
      podsStore.loadAll();
    }
  }

  componentWillUnmount() {
    waterStore.reset();
  }

  render() {
    const { object: water } = this.props;
    if (!water) return null
    const images = water.getImages()
    const selectors = water.getSelectors()
    const nodeSelector = water.getNodeSelectors()
    const childPods = waterStore.getChildPods(water)
    const metrics = waterStore.metrics
    // const childStatefulsets = waterStore.getChildEnhanceStatefulset(water)
    return (
      <div className="StoneDetails">
        {podsStore.isLoaded && (
          <ResourceMetrics
            loader={() => waterStore.loadMetrics(water)}
            tabs={podMetricTabs} object={water} params={{ metrics }}
          >
            <PodCharts />
          </ResourceMetrics>
        )}
        <KubeObjectMeta object={water} />
        {selectors.length &&
          <DrawerItem name={`Selector`} labelsOnly>
            {
              selectors.map(label => <Badge key={label} label={label} />)
            }
          </DrawerItem>
        }
        {nodeSelector.length > 0 &&
          <DrawerItem name={`Node Selector`} labelsOnly>
            {
              nodeSelector.map(label => (
                <Badge key={label} label={label} />
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
        <DrawerItem name={`Pod Status`} className="pod-status">
          <PodDetailsStatuses pods={childPods} />
        </DrawerItem>
        <ResourceMetricsText metrics={metrics} />
        <PodDetailsList pods={childPods} owner={water} />
        <KubeEventDetails object={water} />
      </div>
    )
  }
}

apiManager.registerViews(waterApi, {
  Details: WaterDetails
})