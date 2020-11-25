import "./pod-details-tolerations.scss";
import * as React from "react";
import { Pod, Deployment, DaemonSet, StatefulSet, ReplicaSet, Job, EnhanceStatefulSet } from "@pskishere/piral-compass-api";
import { DrawerParamToggler, DrawerItem } from "@pskishere/piral-compass-drawer";

interface Props {
  workload: Pod | Deployment | DaemonSet | StatefulSet | ReplicaSet | Job | EnhanceStatefulSet;
}

export class PodDetailsTolerations extends React.Component<Props> {
  render() {
    const { workload } = this.props
    const tolerations = workload.getTolerations()
    if (!tolerations.length) return null
    return (
      <DrawerItem name={`Tolerations`} className="PodDetailsTolerations">
        <DrawerParamToggler label={tolerations.length}>
          {
            tolerations.map((toleration, index) => {
              const { key, operator, effect, tolerationSeconds } = toleration
              return (
                <div className="toleration" key={index}>
                  <DrawerItem name={`Key`}>{key}</DrawerItem>
                  {operator && <DrawerItem name={`Operator`}>{operator}</DrawerItem>}
                  {effect && <DrawerItem name={`Effect`}>{effect}</DrawerItem>}
                  {!!tolerationSeconds && <DrawerItem name={`Effect`}>{tolerationSeconds}</DrawerItem>}
                </div>
              )
            })
          }
        </DrawerParamToggler>
      </DrawerItem>
    )
  }
}