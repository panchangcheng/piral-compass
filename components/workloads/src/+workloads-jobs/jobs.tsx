import "./jobs.scss";

import React from "react";
import {observer} from "mobx-react";
import kebabCase from "lodash/kebabCase";
import {podsStore} from "../+workloads-pods/pods.store";
// import {eventStore} from "compass-base/client/components/+events/event.store";
import {Job, jobApi, apiManager} from "@pskishere/piral-compass-api";
import {KubeObjectMenu, KubeObjectMenuProps, KubeObjectListLayout} from "@pskishere/piral-compass-kube-layout";
// import {KubeEventIcon} from "compass-base/client/components/+events/kube-event-icon";
import {PageComponentProps} from "compass-shell";
import {JobDetails} from "./job-details";
import {jobStore} from "./job.store";

enum sortBy {
  name = "name",
  namespace = "namespace",
  conditions = "conditions",
  age = "age",
}


@observer
export class Jobs extends React.Component<PageComponentProps, any> {

  render() {
    return (
      <KubeObjectListLayout
        className="Jobs"
        store={jobStore}
        dependentStores={[podsStore,]}
        sortingCallbacks={{
          [sortBy.name]: (job: Job) => job.getName(),
          [sortBy.namespace]: (job: Job) => job.getNs(),
          [sortBy.conditions]: (job: Job) => job.getCondition().type,
          [sortBy.age]: (job: Job) => job.getAge(false),
        }}
        searchFilters={[
          (job: Job) => job.getSearchFields(),
        ]}
        renderHeaderTitle={`Jobs`}
        renderTableHeader={[
          {title: `Name`, className: "name", sortBy: sortBy.name},
          {title: `Namespace`, className: "namespace", sortBy: sortBy.namespace},
          {title: `Completions`, className: "completions"},
          // {className: "warning"},
          {title: `Age`, className: "age", sortBy: sortBy.age},
          {title: `Conditions`, className: "conditions", sortBy: sortBy.conditions},
        ]}
        renderTableContents={(job: Job) => {
          const condition = job.getCondition();
          return [
            job.getName(),
            job.getNs(),
            `${job.getCompletions()} / ${job.getDesiredCompletions()}`,
            // <KubeEventIcon object={job}/>,
            job.getAge(),
            condition && {
              title: condition.type,
              className: kebabCase(condition.type),
            }
          ]
        }}
        renderItemMenu={(item: Job) => {
          return <JobMenu object={item}/>
        }}
      />
    )
  }
}

export function JobMenu(props: KubeObjectMenuProps<Job>) {
  return (
    <KubeObjectMenu {...props}/>
  )
}

apiManager.registerViews(jobApi, {Menu: JobMenu})
apiManager.registerStore(jobApi, jobStore);
apiManager.registerViews(jobApi, {Details: JobDetails});