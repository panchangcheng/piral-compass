import "./namespace-details.scss";

import * as React from "react";
import { observer } from "mobx-react";
import { DrawerItem } from "../drawer";
import { cssNames } from "../../utils";
import { Namespace, namespacesApi } from "../../api/endpoints";
import { KubeObjectDetailsProps } from "../kube-object";
import { apiManager } from "../../api/api-manager";
import { KubeObjectMeta } from "../kube-object/kube-object-meta";

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

apiManager.registerViews(namespacesApi, {
  Details: NamespaceDetails
});