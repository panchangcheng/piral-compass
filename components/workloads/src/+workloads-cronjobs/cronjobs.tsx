import "./cronjobs.scss";

import React from "react";
import {observer} from "mobx-react";
import {RouteComponentProps} from "react-router";
import {CronJob, cronJobApi, apiManager} from "@pskishere/piral-compass-api";
import {ICronJobsRouteParams} from "../+workloads";
import {KubeObjectListLayout, KubeObjectMenu, KubeObjectMenuProps} from "@pskishere/piral-compass-kube-layout";
import {cronJobStore} from "./cronjob.store";
import {jobStore} from "../+workloads-jobs/job.store";
// import {eventStore} from "compass-base/client/components/+events/event.store"
// import {KubeEventIcon} from "compass-base/client/components/+events/kube-event-icon";

import {PageComponentProps} from "compass-shell";

enum sortBy {
  name = "name",
  namespace = "namespace",
  suspend = "suspend",
  active = "active",
  lastSchedule = "schedule",
  age = "age",
}

interface Props extends RouteComponentProps<ICronJobsRouteParams> {
}

@observer
export class CronJobs extends React.Component<PageComponentProps, any> {
  render() {
    return (
      <KubeObjectListLayout
        className="CronJobs" store={cronJobStore}
        dependentStores={[jobStore, ]}
        sortingCallbacks={{
          [sortBy.name]: (cronJob: CronJob) => cronJob.getName(),
          [sortBy.namespace]: (cronJob: CronJob) => cronJob.getNs(),
          [sortBy.suspend]: (cronJob: CronJob) => cronJob.getSuspendFlag(),
          [sortBy.active]: (cronJob: CronJob) => cronJobStore.getActiveJobsNum(cronJob),
          [sortBy.lastSchedule]: (cronJob: CronJob) => cronJob.getLastScheduleTime(),
          [sortBy.age]: (cronJob: CronJob) => cronJob.getAge(false),
        }}
        searchFilters={[
          (cronJob: CronJob) => cronJob.getSearchFields(),
          (cronJob: CronJob) => cronJob.getSchedule(),
        ]}
        renderHeaderTitle={`Cron Jobs`}
        renderTableHeader={[
          {title: `Name`, className: "name", sortBy: sortBy.name},
          // {className: "warning"},
          {title: `Namespace`, className: "namespace", sortBy: sortBy.namespace},
          {title: `Schedule`, className: "schedule"},
          {title: `Suspend`, className: "suspend", sortBy: sortBy.suspend},
          {title: `Active`, className: "active", sortBy: sortBy.active},
          {title: `Last schedule`, className: "last-schedule", sortBy: sortBy.lastSchedule},
          {title: `Age`, className: "age", sortBy: sortBy.age},
        ]}
        renderTableContents={(cronJob: CronJob) => [
          cronJob.getName(),
          // <KubeEventIcon object={cronJob} filterEvents={events => {
          //   if (!cronJob.isNeverRun()) return events;
          //   return events.filter(event => event.reason != "FailedNeedsStart");
          // }
          // }/>,
          cronJob.getNs(),
          cronJob.isNeverRun() ? `never` : cronJob.getSchedule(),
          cronJob.getSuspendFlag(),
          cronJobStore.getActiveJobsNum(cronJob),
          cronJob.getLastScheduleTime(),
          cronJob.getAge(),
        ]}
        renderItemMenu={(item: CronJob) => {
          return <CronJobMenu object={item}/>
        }}
      />
    )
  }
}

export function CronJobMenu(props: KubeObjectMenuProps<CronJob>) {
  return (
    <KubeObjectMenu {...props}/>
  )
}

apiManager.registerViews(cronJobApi, {
  Menu: CronJobMenu,
})