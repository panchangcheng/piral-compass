import "./pod-details.scss"

import * as React from "react";
import kebabCase from "lodash/kebabCase";
import { disposeOnUnmount, observer } from "mobx-react";
import { Link } from "react-router-dom";
import { autorun, observable, reaction, toJS } from "mobx";
import { IPodMetrics, nodesApi, Pod, podsApi, pvcApi } from "compass-base/client/api/endpoints";
import { DrawerItem, DrawerTitle } from "compass-base/client/components/drawer";
import { Badge } from "compass-base/client/components/badge";
import { autobind, cssNames, interval } from "compass-base/client/utils";
import { PodDetailsContainer } from "./pod-details-container";
import { PodDetailsAffinities } from "./pod-details-affinities";
import { PodDetailsTolerations } from "./pod-details-tolerations";
import { Icon } from "compass-base/client/components/icon";
import { KubeEventDetails } from "compass-base/client/components/+events/kube-event-details";
import { PodDetailsSecrets } from "./pod-details-secrets";
import { ResourceMetrics } from "compass-base/client/components/resource-metrics";
import { podsStore } from "./pods.store";
import { getDetailsUrl } from "compass-base/client/navigation";
import { KubeObjectDetailsProps } from "compass-base/client/components/kube-object";
import { getItemMetrics } from "compass-base/client/api/endpoints/metrics.api";
import { PodCharts, podMetricTabs } from "./pod-charts";
import { lookupApiLink } from "compass-base/client/api/kube-api";
import { apiManager } from "compass-base/client/api/api-manager";
import { KubeObjectMeta } from "compass-base/client/components/kube-object/kube-object-meta";

interface Props extends KubeObjectDetailsProps<Pod> {
}

@observer
export class PodDetails extends React.Component<Props> {
  @observable containerMetrics: IPodMetrics;

  private watcher = interval(60, () => this.loadMetrics());

  componentDidMount() {
    disposeOnUnmount(this, [
      autorun(() => {
        this.containerMetrics = null;
        this.loadMetrics();
      }),
      reaction(() => this.props.object, () => {
        podsStore.reset();
      })
    ]);
    this.watcher.start();
  }

  componentWillUnmount() {
    podsStore.reset();
  }

  @autobind()
  async loadMetrics() {
    const { object: pod } = this.props;
    this.containerMetrics = await podsStore.loadContainerMetrics(pod);
  }

  render() {
    const { object: pod } = this.props;
    if (!pod) return null;
    const { status, spec } = pod;
    const { conditions, podIP } = status;
    const { nodeName } = spec;
    const ownerRefs = pod.getOwnerRefs();
    const nodeSelector = pod.getNodeSelectors();
    const volumes = pod.getVolumes();
    const labels = pod.getLabels();
    const metrics = podsStore.metrics;
    return (
      <div className="PodDetails">
        <ResourceMetrics
          loader={() => podsStore.loadMetrics(pod)}
          tabs={podMetricTabs} object={pod} params={{ metrics }}
        >
          <PodCharts/>
        </ResourceMetrics>
        <KubeObjectMeta object={pod}/>
        <DrawerItem name={`Status`}>
          <span className={cssNames("status", kebabCase(pod.getStatusMessage()))}>{pod.getStatusMessage()}</span>
        </DrawerItem>
        <DrawerItem name={`Node`}>
          {nodeName && (
            <Link to={getDetailsUrl(nodesApi.getUrl({ name: nodeName }))}>
              {nodeName}
            </Link>
          )}
        </DrawerItem>
        <DrawerItem name={`Pod IP`}>
          {podIP}
        </DrawerItem>
        <DrawerItem name={`Priority Class`}>
          {pod.getPriorityClassName()}
        </DrawerItem>
        <DrawerItem name={`QoS Class`}>
          {pod.getQosClass()}
        </DrawerItem>
        {conditions &&
        <DrawerItem name={`Conditions`} className="conditions" labelsOnly>
          {
            conditions.map(condition => {
              const { type, status, lastTransitionTime } = condition;
              return (
                <Badge
                  key={type}
                  label={type}
                  className={cssNames({ disabled: status === "False" })}
                  tooltip={`Last transition time: {lastTransitionTime}`}
                />
              )
            })
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
        {ownerRefs.length > 0 &&
        <DrawerItem name={`Controlled By`}>
          {
            ownerRefs.map(ref => {
              const { name, kind } = ref;
              const ownerDetailsUrl = getDetailsUrl(lookupApiLink(ref, pod));
              return (
                <p key={name}>
                  {kind} <Link to={ownerDetailsUrl}>{name}</Link>
                </p>
              );
            })
          }
        </DrawerItem>
        }
        <PodDetailsTolerations workload={pod}/>
        <PodDetailsAffinities workload={pod}/>

        {pod.getSecrets().length > 0 && (
          <DrawerItem name={`Secrets`}>
            <PodDetailsSecrets pod={pod}/>
          </DrawerItem>
        )}

        {pod.getInitContainers() && pod.getInitContainers().length > 0 &&
        <DrawerTitle title={`Init Containers`}/>
        }
        {
          pod.getInitContainers() && pod.getInitContainers().map(container => {
            return <PodDetailsContainer key={container.name} pod={pod} container={container}/>
          })
        }
        <DrawerTitle title={`Containers`}/>
        {
          pod.getContainers().map(container => {
            const { name } = container;
            const metrics = getItemMetrics(toJS(this.containerMetrics), name);
            return (
              <PodDetailsContainer
                key={name}
                pod={pod}
                container={container}
                metrics={metrics}
              />
            )
          })
        }

        {volumes.length > 0 && (
          <>
            <DrawerTitle title={`Volumes`}/>
            {volumes.map(volume => {
              const claimName = volume.persistentVolumeClaim ? volume.persistentVolumeClaim.claimName : null;
              return (
                <div key={volume.name} className="volume">
                  <div className="title flex gaps">
                    <Icon small material="storage"/>
                    <span>{volume.name}</span>
                  </div>
                  <DrawerItem name={`Type`}>
                    {Object.keys(volume)[1]}
                  </DrawerItem>
                  {claimName && (
                    <DrawerItem name={`Claim Name`}>
                      <Link  to={getDetailsUrl(pvcApi.getUrl({name: claimName, namespace: pod.getNs()}))}>
                        {claimName}
                      </Link>
                    </DrawerItem>
                  )}
                </div>
              )
            })}
          </>
        )}
        <KubeEventDetails object={pod}/>
      </div>
    )
  }
}

apiManager.registerViews(podsApi, {
  Details: PodDetails
})