import "./issuers.scss"

import * as React from "react";
import { observer } from "mobx-react";
import { KubeObjectMenu, KubeObjectMenuProps } from "../../kube-object/kube-object-menu";
import { KubeObjectListLayout, KubeObjectListLayoutProps } from "../../kube-object";
import { clusterIssuersApi, Issuer, issuersApi } from "../../../api/endpoints/cert-manager.api";
import { cssNames } from "../../../utils";
import { Badge } from "../../badge";
import { Spinner } from "../../spinner";
import { apiManager } from "../../../api/api-manager";

enum sortBy {
  name = "name",
  namespace = "namespace",
  type = "type",
  labels = "labels",
  age = "age",
}

@observer
export class ClusterIssuers extends React.Component<KubeObjectListLayoutProps> {
  render() {
    const store = apiManager.getStore(clusterIssuersApi);
    return (
      <Issuers
        {...this.props}
        isClusterScoped={true}
        store={store}
        renderHeaderTitle={`Cluster Issuers`}
      />
    )
  }
}

@observer
export class Issuers extends React.Component<KubeObjectListLayoutProps> {
  render() {
    const { store = apiManager.getStore(issuersApi), ...layoutProps } = this.props;
    if (!store) {
      return <Spinner center/>
    }
    return (
      <KubeObjectListLayout
        store={store}
        renderHeaderTitle={`Issuers`}
        {...layoutProps}
        className="Issuers"
        sortingCallbacks={{
          [sortBy.name]: (item: Issuer) => item.getName(),
          [sortBy.namespace]: (item: Issuer) => item.getNs(),
          [sortBy.type]: (item: Issuer) => item.getType(),
          [sortBy.labels]: (item: Issuer) => item.getLabels(),
          [sortBy.age]: (item: Issuer) => item.getAge(false),
        }}
        searchFilters={[
          (item: Issuer) => item.getSearchFields(),
          (item: Issuer) => item.getType(),
        ]}
        renderTableHeader={[
          { title: `Name`, className: "name", sortBy: sortBy.name },
          { title: `Namespace`, className: "namespace", sortBy: sortBy.namespace },
          { title: `Labels`, className: "labels", sortBy: sortBy.labels },
          { title: `Type`, className: "type", sortBy: sortBy.type },
          { title: `Age`, className: "age", sortBy: sortBy.age },
          { title: `Status`, className: "status" },
        ]}
        renderTableContents={(issuer: Issuer) => [
          issuer.getName(),
          issuer.getNs(),
          issuer.getLabels().map(label => <Badge key={label} label={label} title={label}/>),
          issuer.getType(),
          issuer.getAge(),
          issuer.getConditions().map(({ type, tooltip, isReady }) => {
            return (
              <Badge
                key={type}
                label={type}
                tooltip={tooltip}
                className={cssNames({ [type.toLowerCase()]: isReady })}
              />
            )
          })
        ]}
        renderItemMenu={(item: Issuer) => {
          return <IssuerMenu object={item}/>
        }}
      />
    );
  }
}

export function IssuerMenu(props: KubeObjectMenuProps<Issuer>) {
  return (
    <KubeObjectMenu {...props}/>
  )
}

apiManager.registerViews([issuersApi, clusterIssuersApi], {
  List: Issuers,
  Menu: IssuerMenu,
})
