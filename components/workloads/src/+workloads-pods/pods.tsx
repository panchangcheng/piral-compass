import "./pods.scss"

import React from "react";
import {observer} from "mobx-react";
import {Link} from "react-router-dom";
import {podsStore} from "./pods.store";
import {RouteComponentProps} from "react-router";
// import {volumeClaimStore} from "../+storage-volume-claims/volume-claim.store";
import {IPodsRouteParams} from "../+workloads";
import {eventStore} from "compass-base/client/components/+events/event.store";
import {KubeObjectListLayout} from "compass-base/client/components/kube-object";
import {Pod, podsApi} from "compass-base/client/api/endpoints";
import {PodMenu} from "./pod-menu";
import {stopPropagation} from "compass-base/client/utils";
import {KubeEventIcon} from "compass-base/client/components/+events/kube-event-icon";
import {getDetailsUrl} from "compass-base/client/navigation";
import kebabCase from "lodash/kebabCase";
import {lookupApiLink} from "compass-base/client/api/kube-api";
import {apiManager} from "compass-base/client/api/api-manager";
import {PodContainerStatuses} from "./pod-container-statuses";
import {TooltipContent, Tooltip} from "compass-base/client/components/tooltip";
import {PageComponentProps} from "compass-shell"

enum sortBy {
  name = "name",
  namespace = "namespace",
  containers = "containers",
  restarts = "restarts",
  age = "age",
  qos = "qos",
  node = "node",
  owners = "owners",
  status = "status",
}

interface Props extends RouteComponentProps<IPodsRouteParams> {
}

@observer
export class Pods extends React.Component<PageComponentProps, any> {

  renderStatus(pod: Pod) {
    const b = pod.getStatusMessage(true);
    const tooltipId = pod.getName();
    const tooltip = (
      <>
        <span id={tooltipId}>{b.reason}</span>
        {b.message != "" ?
          <Tooltip htmlFor={tooltipId} following>
            <TooltipContent tableView>{b.message}</TooltipContent>
          </Tooltip> : null}
      </>
    );
    return {title: tooltip, className: kebabCase(b.reason)}
  }

  render() {
    return (
      <KubeObjectListLayout
        className="Pods" store={podsStore}
        dependentStores={[eventStore]}
        sortingCallbacks={{
          [sortBy.name]: (pod: Pod) => pod.getName(),
          [sortBy.namespace]: (pod: Pod) => pod.getNs(),
          [sortBy.containers]: (pod: Pod) => pod.getContainers().length,
          [sortBy.restarts]: (pod: Pod) => pod.getRestartsCount(),
          [sortBy.node]: (pod: Pod) => pod.getNodeName(),
          [sortBy.owners]: (pod: Pod) => pod.getOwnerRefs().map(ref => ref.kind),
          [sortBy.qos]: (pod: Pod) => pod.getQosClass(),
          [sortBy.age]: (pod: Pod) => pod.getAge(false),
          [sortBy.status]: (pod: Pod) => pod.getStatusMessage(),
        }}
        searchFilters={[
          (pod: Pod) => pod.getSearchFields(),
          (pod: Pod) => pod.getStatusMessage(),
        ]}
        renderHeaderTitle={`Pods`}
        renderTableHeader={[
          {title: `Name`, className: "name", sortBy: sortBy.name},
          {className: "warning"},
          {title: `Namespace`, className: "namespace", sortBy: sortBy.namespace},
          {title: `Containers`, className: "containers", sortBy: sortBy.containers},
          {title: `Restarts`, className: "restarts", sortBy: sortBy.restarts},
          {title: `Controlled By`, className: "owners", sortBy: sortBy.owners},
          {title: `Node`, className: "node", sortBy: sortBy.node},
          {title: `QoS`, className: "qos", sortBy: sortBy.qos},
          {title: `Age`, className: "age", sortBy: sortBy.age},
          {title: `Status`, className: "status", sortBy: sortBy.status},
        ]}
        renderTableContents={(pod: Pod) => [
          pod.getName(),
          pod.hasIssues() && <KubeEventIcon object={pod}/>,
          pod.getNs(),
          <PodContainerStatuses pod={pod}/>,
          pod.getRestartsCount(),
          pod.getOwnerRefs().map(ref => {
            const {kind, name} = ref;
            const detailsLink = getDetailsUrl(lookupApiLink(ref, pod));
            return (
              <Link key={name} to={detailsLink} className="owner" onClick={stopPropagation}>
                {kind}
              </Link>
            )
          }),
          pod.getNodeName(),
          pod.getQosClass(),
          pod.getAge(),
          this.renderStatus(pod),
        ]}
        renderItemMenu={(item: Pod) => {
          return <PodMenu object={item}/>
        }}
      />
    )
  }
}

apiManager.registerViews(podsApi, {
  Menu: PodMenu,
})