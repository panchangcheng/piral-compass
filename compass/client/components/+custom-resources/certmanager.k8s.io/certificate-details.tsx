import "./certificate-details.scss"

import React from "react";
import moment from "moment"
import { observer } from "mobx-react";
import { Link } from "react-router-dom";
import { DrawerItem, DrawerTitle } from "../../drawer";
import { Badge } from "../../badge";
import { KubeEventDetails } from "../../+events/kube-event-details";
import { KubeObjectDetailsProps } from "../../kube-object";
import { Certificate, certificatesApi } from "../../../api/endpoints/cert-manager.api";
import { cssNames } from "../../../utils";
import { apiManager } from "../../../api/api-manager";
import { KubeObjectMeta } from "../../kube-object/kube-object-meta";

interface Props extends KubeObjectDetailsProps<Certificate> {
}

@observer
export class CertificateDetails extends React.Component<Props> {
  render() {
    const { object: cert, className } = this.props;
    if (!cert) return;
    const { spec, status } = cert;
    const { acme, isCA, commonName, secretName, dnsNames, duration, ipAddresses, keyAlgorithm, keySize, organization, renewBefore } = spec;
    const { lastFailureTime, notAfter } = status;
    return (
      <div className={cssNames("CertificateDetails", className)}>
        <KubeObjectMeta object={cert}/>

        <DrawerItem name={`Issuer`}>
          <Link to={cert.getIssuerDetailsUrl()}>
            {cert.getIssuerName()}
          </Link>
        </DrawerItem>

        <DrawerItem name={`Secret Name`}>
          <Link to={cert.getSecretDetailsUrl()}>
            {secretName}
          </Link>
        </DrawerItem>

        <DrawerItem name="CA">
          {isCA ? `Yes` : `No`}
        </DrawerItem>

        {commonName && (
          <DrawerItem name={`Common Name`}>
            {commonName}
          </DrawerItem>
        )}
        {dnsNames && (
          <DrawerItem name={`DNS names`} labelsOnly>
            {dnsNames.map(name => <Badge key={name} label={name}/>)}
          </DrawerItem>
        )}
        {ipAddresses && (
          <DrawerItem name={`IP addresses`}>
            {ipAddresses.join(", ")}
          </DrawerItem>
        )}
        {organization && (
          <DrawerItem name={`Organization`}>
            {organization.join(", ")}
          </DrawerItem>
        )}
        {duration && (
          <DrawerItem name={`Duration`}>
            {duration}
          </DrawerItem>
        )}
        {renewBefore && (
          <DrawerItem name={`Renew Before`}>
            {renewBefore}
          </DrawerItem>
        )}
        {keySize && (
          <DrawerItem name={`Key Size`}>
            {keySize}
          </DrawerItem>
        )}
        {keyAlgorithm && (
          <DrawerItem name={`Key Algorithm`}>
            {keyAlgorithm}
          </DrawerItem>
        )}

        <DrawerItem name={`Not After`}>
          {moment(notAfter).format("LLL")}
        </DrawerItem>

        {lastFailureTime && (
          <DrawerItem name={`Last Failure Time`}>
            {lastFailureTime}
          </DrawerItem>
        )}
        <DrawerItem name={`Status`} labelsOnly>
          {cert.getConditions().map(({ type, tooltip, isReady }) => {
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

        {acme && (
          <>
            <DrawerTitle title="ACME"/>
            {acme.config.map(({ domains, http01, dns01 }, index) => {
              return (
                <div key={index} className="acme-config">
                  <DrawerItem name={`Domains`} labelsOnly>
                    {domains.map(domain => <Badge key={domain} label={domain}/>)}
                  </DrawerItem>
                  <DrawerItem name={`Http01`}>
                    {Object.entries(http01).map(([key, val]) => `${key}: ${val}`)[0]}
                  </DrawerItem>
                  {dns01 && (
                    <DrawerItem name={`DNS Provider`} labelsOnly>
                      {dns01.provider}
                    </DrawerItem>
                  )}
                </div>
              )
            })}
          </>
        )}

        <KubeEventDetails object={cert}/>
      </div>
    );
  }
}

apiManager.registerViews(certificatesApi, {
  Details: CertificateDetails
})