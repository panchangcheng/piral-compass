import "./namespace-details.scss";

import * as React from "react";
import { observer } from "mobx-react";
import { DrawerItem } from "compass-base/client/components/drawer";
import { cssNames } from "compass-base/client/utils";
import { Namespace } from "compass-base/client/api/endpoints";
import { KubeObjectDetailsProps } from "compass-base/client/components/kube-object";
import { KubeObjectMeta } from "compass-base/client/components/kube-object/kube-object-meta";

interface Props extends KubeObjectDetailsProps<Namespace> {
}

@observer
export class NamespaceDetails extends React.Component<Props> {

  render() {
    const { object: namespace } = this.props;
    if (!namespace) return;
    const status = namespace.getStatus();
    return (
      <div className="NamespaceDetails">
        <KubeObjectMeta object={namespace}/>

        <DrawerItem name={`Status`}>
          <span className={cssNames("status", status.toLowerCase())}>{status}</span>
        </DrawerItem>
      </div>
    );
  }
}

