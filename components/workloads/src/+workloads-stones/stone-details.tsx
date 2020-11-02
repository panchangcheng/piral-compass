import "./stone-details.scss";

import React from "react";
import { disposeOnUnmount, observer } from "mobx-react";
import { reaction } from "mobx";
import { Badge } from "compass-base/client/components/badge";
import { DrawerItem } from "compass-base/client/components/drawer";
import { PodDetailsStatuses } from "../+workloads-pods/pod-details-statuses";
import { KubeEventDetails } from "compass-base/client/components/+events/kube-event-details";
import { podsStore } from "../+workloads-pods/pods.store";
import { stoneStore } from "./stones.store";
import { KubeObjectDetailsProps } from "compass-base/client/components/kube-object";
import { Stone, stoneApi } from "compass-base/client/api/endpoints";
import { ResourceMetrics, ResourceMetricsText } from "compass-base/client/components/resource-metrics";
import { PodCharts, podMetricTabs } from "../+workloads-pods/pod-charts";
import { PodDetailsList } from "../+workloads-pods/pod-details-list";
import { apiManager } from "compass-base/client/api/api-manager";
import { KubeObjectMeta } from "compass-base/client/components/kube-object/kube-object-meta";

interface Props extends KubeObjectDetailsProps<Stone> {
}

@observer
export class StoneDetails extends React.Component<Props> {

  @disposeOnUnmount
  clean = reaction(() => this.props.object, () => {
    stoneStore.reset();
  });

  componentDidMount() {
    if (!podsStore.isLoaded) {
      podsStore.loadAll();
    }
  }

  componentWillUnmount() {
    stoneStore.reset();
  }

  render() {
    const { object: stone } = this.props;
    if (!stone) return null
    const images = stone.getImages()
    const selectors = stone.getSelectors()
    const nodeSelector = stone.getNodeSelectors()
    const childPods = stoneStore.getChildPods(stone)
    const metrics = stoneStore.metrics
    const statefulsets = stoneStore.getChildEnhanceStatefulset(stone);
    return (
      <div className="StoneDetails">
        {podsStore.isLoaded && (
          <ResourceMetrics
            loader={() => stoneStore.loadMetrics(stone)}
            tabs={podMetricTabs} object={stone} params={{ metrics }}
          >
            <PodCharts />
          </ResourceMetrics>
        )}
        <KubeObjectMeta object={stone} />
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
        <PodDetailsList pods={childPods} owner={stone} />
        <KubeEventDetails object={stone} />

        {statefulsets.length > 0 &&
          <>
            {statefulsets.map(statefulset => <KubeEventDetails object={statefulset} title={"Event:statefulset-" + statefulset.getName()} />)}
          </>
        }

        {childPods.length > 0 &&
          <>
            {childPods.map(pod => <KubeEventDetails object={pod} title={"Event:pod-" + pod.getName()} />)}
          </>
        }
      </div>
    )
  }
}

apiManager.registerViews(stoneApi, {
  Details: StoneDetails
})