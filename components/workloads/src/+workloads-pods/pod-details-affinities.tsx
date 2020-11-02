import "./pod-details-affinities.scss";
import * as React from "react";
import jsYaml from "js-yaml";
import { AceEditor } from "compass-base/client/components/ace-editor";
import { DrawerParamToggler, DrawerItem } from "compass-base/client/components/drawer";
import { Pod, Deployment, DaemonSet, StatefulSet, ReplicaSet, Job, EnhanceStatefulSet } from "compass-base/client/api/endpoints";

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