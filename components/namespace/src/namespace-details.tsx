import "./namespace-details.scss";

import * as React from "react";
import { observer } from "mobx-react";
import { DrawerItem } from "@pskishere/piral-compass-drawer";
import { cssNames } from "@pskishere/piral-compass-utils";
import { Namespace } from "@pskishere/piral-compass-api";
import { KubeObjectDetailsProps, KubeObjectMeta} from "@pskishere/piral-compass-kube-layout";

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

