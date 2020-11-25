import "./pod-details-container.scss"

import * as React from "react";
import { IPodContainer, Pod } from "@pskishere/piral-compass-api";
import { DrawerItem } from "@pskishere/piral-compass-drawer";
import { cssNames } from "@pskishere/piral-compass-utils";
import { StatusBrick } from "@pskishere/piral-compass-status-brick";
import { Badge } from "@pskishere/piral-compass-badge";
import { ContainerEnvironment } from "./pod-container-env";
import { ResourceMetrics } from "compass-base/client/components/resource-metrics";
import { IMetrics } from "compass-base/client/api/endpoints/metrics.api";
import { ContainerCharts } from "./container-charts";

interface Props {
  pod: Pod;
  container: IPodContainer;
  metrics?: { [key: string]: IMetrics };
}

export class PodDetailsContainer extends React.Component<Props> {
  render() {
    const { pod, container, metrics } = this.props
    if (!pod || !container) return null
    const { name, image, imagePullPolicy, ports, volumeMounts, command, args } = container
    const status = pod.getContainerStatuses().find(status => status.name === container.name)
    const state = status ? Object.keys(status.state)[0] : ""
    const ready = status ? status.ready : ""
    const liveness = pod.getLivenessProbe(container)
    const readiness = pod.getReadinessProbe(container)
    const isInitContainer = !!pod.getInitContainers().find(c => c.name == name);
    const metricTabs = [
      `CPU`,
      `Memory`,
      `Filesystem`,
    ];
    return (
      <div className="PodDetailsContainer">
        <div className="pod-container-title">
          <StatusBrick className={cssNames(state, { ready })}/>{name}
        </div>
        {!isInitContainer &&
        <ResourceMetrics tabs={metricTabs} params={{ metrics }}>
          <ContainerCharts/>
        </ResourceMetrics>
        }
        {status &&
        <DrawerItem name={`Status`}>
          <span className={cssNames("status", state)}>
            {state}{ready ? `, ${`ready`}` : ""}
            {state === 'terminated' ? ` - ${status.state.terminated.reason} (${`exit code`}: ${status.state.terminated.exitCode})` : ''}
          </span>
        </DrawerItem>
        }
        <DrawerItem name={`Image`}>
          {image}
        </DrawerItem>
        {imagePullPolicy && imagePullPolicy !== "IfNotPresent" &&
        <DrawerItem name={`ImagePullPolicy`}>
          {imagePullPolicy}
        </DrawerItem>
        }
        {ports && ports.length > 0 &&
        <DrawerItem name={`Ports`}>
          {
            ports.map(port => {
              const { name, containerPort, protocol } = port;
              const key = `${container.name}-port-${containerPort}-${protocol}`
              return (
                <div key={key}>
                  {name ? name + ': ' : ''}{containerPort}/{protocol}
                </div>
              )
            })
          }
        </DrawerItem>
        }
        {<ContainerEnvironment container={container} namespace={pod.getNs()}/>}
        {volumeMounts && volumeMounts.length > 0 &&
        <DrawerItem name={`Mounts`}>
          {
            volumeMounts.map(mount => {
              const { name, mountPath, readOnly } = mount;
              return (
                <React.Fragment key={name + mountPath}>
                  <span className="mount-path">{mountPath}</span>
                  <span className="mount-from">from {name} ({readOnly ? 'ro' : 'rw'})</span>
                </React.Fragment>
              )
            })
          }
        </DrawerItem>
        }
        {liveness.length > 0 &&
        <DrawerItem name={`Liveness`} labelsOnly>
          {
            liveness.map((value, index) => (
              <Badge key={index} label={value}/>
            ))
          }
        </DrawerItem>
        }
        {readiness.length > 0 &&
        <DrawerItem name={`Readiness`} labelsOnly>
          {
            readiness.map((value, index) => (
              <Badge key={index} label={value}/>
            ))
          }
        </DrawerItem>
        }
        {command &&
        <DrawerItem name={`Command`}>
          {command}
        </DrawerItem>
        }

        {args &&
        <DrawerItem name={`Arguments`}>
          {args.join(' ')}
        </DrawerItem>
        }
      </div>
    )
  }
}