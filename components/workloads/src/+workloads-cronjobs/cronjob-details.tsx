import "./cronjob-details.scss";

import React from "react";
import kebabCase from "lodash/kebabCase";
import { observer } from "mobx-react";
import { DrawerItem, DrawerTitle } from "@pskishere/piral-compass-drawer";
import { CronJob, cronJobApi, Job, apiManager } from "@pskishere/piral-compass-api";
import { getDetailsUrl } from "@pskishere/piral-compass-utils";
import { KubeObjectDetailsProps, KubeObjectMeta } from "@pskishere/piral-compass-kube-layout";
import { Badge } from "@pskishere/piral-compass-badge";
import { jobStore } from "../+workloads-jobs/job.store";
import { Link } from "react-router-dom";
// import { KubeEventDetails } from "compass-base/client/components/+events/kube-event-details";
import { cronJobStore } from "./cronjob.store";


interface Props extends KubeObjectDetailsProps<CronJob> {
}

@observer
export class CronJobDetails extends React.Component<Props> {
  async componentDidMount() {
    if (!jobStore.isLoaded) {
      jobStore.loadAll();
    }
  }

  render() {
    const { object: cronJob } = this.props;
    if (!cronJob) return null;
    const childJobs = jobStore.getJobsByOwner(cronJob)
    return (
      <div className="CronJobDetails">
        <KubeObjectMeta object={cronJob}/>
        <DrawerItem name={`Schedule`}>
          {cronJob.isNeverRun() ? (
            <>
              `never` ({cronJob.getSchedule()})
            </>
          ) : cronJob.getSchedule()}
        </DrawerItem>
        <DrawerItem name={`Active`}>
          {cronJobStore.getActiveJobsNum(cronJob)}
        </DrawerItem>
        <DrawerItem name={`Suspend`}>
          {cronJob.getSuspendFlag()}
        </DrawerItem>
        <DrawerItem name={`Last schedule`}>
          {cronJob.getLastScheduleTime()}
        </DrawerItem>
        {childJobs.length > 0 &&
          <>
            <DrawerTitle title={`Jobs`}/>
            {childJobs.map((job: Job) => {
              const selectors = job.getSelectors()
              const condition = job.getCondition()
              return (
                <div className="job" key={job.getId()}>
                  <div className="title">
                    <Link to={getDetailsUrl(job.selfLink)}>
                      {job.getName()}
                    </Link>
                  </div>
                  <DrawerItem name={`Condition`} className="conditions" labelsOnly>
                    {condition && (
                      <Badge
                        label={condition.type}
                        className={kebabCase(condition.type)}
                      />
                    )}
                  </DrawerItem>
                  <DrawerItem name={`Selector`} labelsOnly>
                    {
                      selectors.map(label => <Badge key={label} label={label}/>)
                    }
                  </DrawerItem>
                </div>
              )})
            }
          </>
        }
        {/* <KubeEventDetails object={cronJob}/> */}
      </div>
    )
  }
}

apiManager.registerViews(cronJobApi, {
  Details: CronJobDetails,
})