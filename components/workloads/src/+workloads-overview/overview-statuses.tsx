import "./overview-statuses.scss"

import React from "react";
import store from "store";
import { observer } from "mobx-react";
import { OverviewWorkloadStatus } from "./overview-workload-status";
import { Link } from "react-router-dom";
import { PageFiltersList } from "@pskishere/piral-compass-kube-layout";
import { cronJobsURL, daemonSetsURL, deploymentsURL, jobsURL, podsURL, statefulSetsURL, enhanceStatefulSetsURL, stonesURL, watersURL } from "../+workloads";
import { podsStore } from "../+workloads-pods/pods.store";
import { deploymentStore } from "../+workloads-deployments/deployments.store";
import { daemonSetStore } from "../+workloads-daemonsets/daemonsets.store";
import { statefulSetStore } from "../+workloads-statefulsets/statefulset.store";
import { jobStore } from "../+workloads-jobs/job.store";
import { cronJobStore } from "../+workloads-cronjobs/cronjob.store";
// import { namespaceStore } from "compass-base/client/components/+namespaces/namespace.store";
import { enhanceStatefulSetStore } from "../+workloads-enhancestatefulsets/enhancestatefulset.store"
import { stoneStore } from "../+workloads-stones/stones.store"

// import { NamespaceSelectFilter } from "compass-base/client/components/+namespaces/namespace-select";
import { waterStore } from "../+workloads-waters/waters.store";


@observer
export class OverviewStatuses extends React.Component {
  render() {
    const { contextNs } = namespaceStore;
    const pods = podsStore.getAllByNs(contextNs);
    const deployments = deploymentStore.getAllByNs(contextNs);
    const statefulSets = statefulSetStore.getAllByNs(contextNs);
    const daemonSets = daemonSetStore.getAllByNs(contextNs);
    const jobs = jobStore.getAllByNs(contextNs);
    const cronJobs = cronJobStore.getAllByNs(contextNs);
    const enhanceStatefulSets = enhanceStatefulSetStore.getAllByNs(contextNs);
    const stones = stoneStore.getAllByNs(contextNs);
    const waters = waterStore.getAllByNs(contextNs);
    const userConifg = store.get('u_config');
    const isClusterAdmin = userConifg ? userConifg.isClusterAdmin : false

    return (
      <div className="OverviewStatuses">
        <div className="header flex gaps align-center">
          <h5 className="box grow">`Overview`</h5>
          {/* <NamespaceSelectFilter /> */}
        </div>
        <PageFiltersList />
        <div className="workloads">
          <div className="workload">
            <div className="title"><Link to={podsURL()}>`Pods` ({pods.length})</Link></div>
            <OverviewWorkloadStatus status={podsStore.getStatuses(pods)} />
          </div>
          <div className="workload">
            <div className="title"><Link to={stonesURL()}>`Stones` ({stones.length})</Link></div>
            <OverviewWorkloadStatus status={stoneStore.getStatuses(stones)} />
          </div>
          <div className="workload">
            <div className="title"><Link to={enhanceStatefulSetsURL()}>`StatefulSets*` ({enhanceStatefulSets.length})</Link></div>
            <OverviewWorkloadStatus status={enhanceStatefulSetStore.getStatuses(enhanceStatefulSets)} />
          </div>
          {isClusterAdmin ?
            <>
              <div className="workload">
                <div className="title"><Link to={watersURL()}>`Waters` ({waters.length})</Link></div>
                <OverviewWorkloadStatus status={waterStore.getStatuses(waters)} />
              </div>
              <div className="workload">
                <div className="title"><Link to={deploymentsURL()}>`Deployments` ({deployments.length})</Link></div>
                <OverviewWorkloadStatus status={deploymentStore.getStatuses(deployments)} />
              </div>
              <div className="workload">
                <div className="title"><Link to={statefulSetsURL()}>`StatefulSets` ({statefulSets.length})</Link></div>
                <OverviewWorkloadStatus status={statefulSetStore.getStatuses(statefulSets)} />
              </div>
              <div className="workload">
                <div className="title"><Link to={daemonSetsURL()}>`DaemonSets` ({daemonSets.length})</Link></div>
                <OverviewWorkloadStatus status={daemonSetStore.getStatuses(daemonSets)} />
              </div>
              <div className="workload">
                <div className="title"><Link to={jobsURL()}>`Jobs` ({jobs.length})</Link></div>
                <OverviewWorkloadStatus status={jobStore.getStatuses(jobs)} />
              </div>
              <div className="workload">
                <div className="title"><Link to={cronJobsURL()}>`CronJobs` ({cronJobs.length})</Link></div>
                <OverviewWorkloadStatus status={cronJobStore.getStatuses(cronJobs)} />
              </div>
            </> : null
          }
        </div>
      </div>
    )
  }
}
