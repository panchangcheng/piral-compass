import "./issuer-details.scss"

import React from "react";
import { observer } from "mobx-react";
import { Link } from "react-router-dom";
import { DrawerItem, DrawerTitle } from "../../drawer";
import { Badge } from "../../badge";
import { KubeEventDetails } from "../../+events/kube-event-details";
import { KubeObjectDetailsProps } from "../../kube-object";
import { clusterIssuersApi, Issuer, issuersApi } from "../../../api/endpoints/cert-manager.api";
import { autobind, cssNames } from "../../../utils";
import { getDetailsUrl } from "../../../navigation";
import { secretsApi } from "../../../api/endpoints";
import { apiManager } from "../../../api/api-manager";
import { KubeObjectMeta } from "../../kube-object/kube-object-meta";

interface Props extends KubeObjectDetailsProps<Issuer> {
}

@observer
export class IssuerDetails extends React.Component<Props> {
  @autobind()
  renderSecretLink(secretName: string) {
    const namespace = this.props.object.getNs();
    if (!namespace) {
      return secretName;
    }
    const secretDetailsUrl = getDetailsUrl(secretsApi.getUrl({
      namespace: namespace,
      name: secretName,
    }));
    return (
      <Link to={secretDetailsUrl}>
        {secretName}
      </Link>
    )
  }

  render() {
    const { object: issuer, className } = this.props;
    if (!issuer) return;
    const { renderSecretLink } = this;
    const { spec: { acme, ca, vault, venafi }, status } = issuer;
    return (
      <div className={cssNames("IssuerDetails", className)}>
        <KubeObjectMeta object={issuer}/>

        <DrawerItem name={`Type`}>
          {issuer.getType()}
        </DrawerItem>

        <DrawerItem name={`Status`} labelsOnly>
          {issuer.getConditions().map(({ type, tooltip, isReady }) => {
            return (
              <Badge
                key={type}
                label={type}
                tooltip={tooltip}
                className={cssNames({ [type.toLowerCase()]: isReady })}
              />
            )
          })}
        </DrawerItem>

        {acme && (() => {
          const { email, server, skipTLSVerify, privateKeySecretRef, solvers } = acme;
          return (
            <>
              <DrawerTitle title="ACME"/>
              <DrawerItem name={`E-mail`}>
                {email}
              </DrawerItem>
              <DrawerItem name={`Server`}>
                {server}
              </DrawerItem>
              {status.acme && (
                <DrawerItem name={`Status URI`}>
                  {status.acme.uri}
                </DrawerItem>
              )}
              <DrawerItem name={`Private Key Secret`}>
                {renderSecretLink(privateKeySecretRef.name)}
              </DrawerItem>
              <DrawerItem name={`Skip TLS Verify`}>
                {skipTLSVerify ? `Yes` : `No`}
              </DrawerItem>
            </>
          )
        })()}

        {ca && (() => {
          const { secretName } = ca;
          return (
            <>
              <DrawerTitle title="CA"/>
              <DrawerItem name={`Secret Name`}>
                {renderSecretLink(secretName)}
              </DrawerItem>
            </>
          )
        })()}

        {vault && (() => {
          const { auth, caBundle, path, server } = vault;
          const { path: authPath, roleId, secretRef } = auth.appRole;
          return (
            <>
              <DrawerTitle title="Vault"/>
              <DrawerItem name={`Server`}>
                {server}
              </DrawerItem>
              <DrawerItem name={`Path`}>
                {path}
              </DrawerItem>
              <DrawerItem name={`CA Bundle`} labelsOnly>
                <Badge label={caBundle}/>
              </DrawerItem>

              <DrawerTitle title={`Auth App Role`}/>
              <DrawerItem name={`Path`}>
                {authPath}
              </DrawerItem>
              <DrawerItem name={`Role ID`}>
                {roleId}
              </DrawerItem>
              {secretRef && (
                <DrawerItem name={`Secret`}>
                  {renderSecretLink(secretRef.name)}
                </DrawerItem>
              )}
            </>
          )
        })()}

        {venafi && (() => {
          const { zone, cloud, tpp } = venafi;
          return (
            <>
              <DrawerTitle title="CA"/>
              <DrawerItem name={`Zone`}>
                {zone}
              </DrawerItem>
              {cloud && (
                <DrawerItem name={`Cloud API Token Secret`}>
                  {renderSecretLink(cloud.apiTokenSecretRef.name)}
                </DrawerItem>
              )}
              {tpp && (
                <>
                  <DrawerTitle title="TPP"/>
                  <DrawerItem name={`URL`}>
                    {tpp.url}
                  </DrawerItem>
                  <DrawerItem name={`CA Bundle`} labelsOnly>
                    <Badge label={tpp.caBundle}/>
                  </DrawerItem>
                  <DrawerItem name={`Credentials Ref`}>
                    {renderSecretLink(tpp.credentialsRef.name)}
                  </DrawerItem>
                </>
              )}
            </>
          )
        })()}

        <KubeEventDetails object={issuer}/>
      </div>
    );
  }
}

apiManager.registerViews([issuersApi, clusterIssuersApi], {
  Details: IssuerDetails
})
