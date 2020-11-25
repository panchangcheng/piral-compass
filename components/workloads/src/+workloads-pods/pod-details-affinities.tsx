import "./pod-details-affinities.scss";
import * as React from "react";
import jsYaml from "js-yaml";
import { AceEditor } from "@pskishere/piral-compass-ace-editor";
import { DrawerParamToggler, DrawerItem } from "@pskishere/piral-compass-drawer";
import { Pod, Deployment, DaemonSet, StatefulSet, ReplicaSet, Job, EnhanceStatefulSet } from "@pskishere/piral-compass-api";

interface Props {
  workload: Pod | Deployment | DaemonSet | StatefulSet | ReplicaSet | Job | EnhanceStatefulSet;
}

export class PodDetailsAffinities extends React.Component<Props> {
  render() {
    const { workload } = this.props
    const affinitiesNum = workload.getAffinityNumber()
    const affinities = workload.getAffinity()
    if (!affinitiesNum) return null
    return (
      <DrawerItem name={`Affinities`} className="PodDetailsAffinities">
        <DrawerParamToggler label={affinitiesNum}>
          <div className="ace-container">
            <AceEditor
              mode="yaml"
              value={jsYaml.dump(affinities)}
              showGutter={false}
              readOnly
            />
          </div>
        </DrawerParamToggler>
      </DrawerItem>
    )
  }
}