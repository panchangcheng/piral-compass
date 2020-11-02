import "./job-details.scss";

import React from "react";
import kebabCase from "lodash/kebabCase";
import { observer } from "mobx-react";
import { DrawerItem } from "compass-base/client/components/drawer";
import { Badge } from "compass-base/client/components/badge";
import { PodDetailsStatuses } from "../+workloads-pods/pod-details-statuses";
import { Link } from "react-router-dom";
import { PodDetailsTolerations } from "../+workloads-pods/pod-details-tolerations";
import { PodDetailsAffinities } from "../+workloads-pods/pod-details-affinities";
import { KubeEventDetails } from "compass-base/client/components/+events/kube-event-details";
import { podsStore } from "../+workloads-pods/pods.store";
import { jobStore } from "./job.store";
import { getDetailsUrl } from "compass-base/client/navigation";
import { KubeObjectDetailsProps } from "compass-base/client/components/kube-object";
import { Job, jobApi } from "compass-base/client/api/endpoints";
import { PodDetailsList } from "../+workloads-pods/pod-details-list";
import { lookupApiLink } from "compass-base/client/api/kube-api";
import { apiManager } from "compass-base/client/api/api-manager";
import { KubeObjectMeta } from "compass-base/client/components/kube-object/kube-object-meta";

interface Props extends KubeObjectDetailsProps<Job> {
}

@observer
export class JobDetails extends React.Component<Props> {
  async componentDidMount() {
    if (!podsStore.isLoaded) {
      podsStore.loadAll();
    }
  }

  render() {
    const { object: job } = this.props;
    if (!job) return null;
    const selectors = job.getSelectors()
    const nodeSelector = job.getNodeSelectors()
    const images = job.getImages()
    const childPods = jobStore.getChildPods(job)
    const ownerRefs = job.getOwnerRefs()
    const condition = job.getCondition()
    return (
      <div className="JobDetails">
        <KubeObjectMeta object={job}/>
        <DrawerItem name={`Selector`} labelsOnly>
          {
            Object.keys(selectors).map(label => <Badge key={label} label={label}/>)
          }
        </DrawerItem>
        {nodeSelector.length > 0 &&
        <DrawerItem name={`Node Selector`} labelsOnly>
          {
            nodeSelector.map(label => (
              <Badge key={label} label={label}/>
            ))
          }
        </DrawerItem>
        }
        {images.length > 0 &&
        <DrawerItem name={`Images`}>
          {
            images.map(image => <p key={image}>{image}</p>)
          }
        </DrawerItem>
        }
        {ownerRefs.length > 0 &&
        <DrawerItem name={`Controlled by`}>
          {
            ownerRefs.map(ref => {
              const { name, kind } = ref;
              const detailsUrl = getDetailsUrl(lookupApiLink(ref, job))
              return (
                <p key={name}>
                  {kind} <Link to={detailsUrl}>{name}</Link>
                </p>
              );
            })
          }
        </DrawerItem>
        }
        <DrawerItem name={`Conditions`} className="conditions" labelsOnly>
          {condition && (
            <Badge
              className={kebabCase(condition.type)}
              label={condition.type}
              tooltip={condition.message}
            />
          )}
        </DrawerItem>
        <DrawerItem name={`Completions`}>
          {job.getDesiredCompletions()}
        </DrawerItem>
        <DrawerItem name={`Parallelism`}>
          {job.getParallelism()}
        </DrawerItem>
        <PodDetailsTolerations workload={job}/>
        <PodDetailsAffinities workload={job}/>
        <DrawerItem name={`Pod Status`} className="pod-status">
          <PodDetailsStatuses pods={childPods}/>
        </DrawerItem>
        <PodDetailsList pods={childPods} owner={job}/>
        <KubeEventDetails object={job}/>
      </div>
    )
  }
}