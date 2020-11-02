import "./workloads.scss"

import * as React from "react";
import store from "store";
import { observer } from "mobx-react";
import { Redirect, Route, Switch } from "react-router";
import { RouteComponentProps } from "react-router-dom";
import { MainLayout, TabRoute } from "compass-base/client/components/layout/main-layout";
import { WorkloadsOverview } from "../+workloads-overview/overview";
import {
  watersRoute,
  watersURL,
  injectorURL,
  injectorsRoute,
  enhanceStatefulSetsURL,
  enhanceStatefulsetsRoute,
  stonesURL,
  stonesRoute,
  cronJobsRoute,
  cronJobsURL,
  daemonSetsRoute,
  daemonSetsURL,
  deploymentsRoute,
  deploymentsURL,
  jobsRoute,
  jobsURL,
  overviewRoute,
  overviewURL,
  podsRoute,
  podsURL,
  statefulSetsRoute,
  statefulSetsURL,
  workloadsURL,
  deployRoute,
  deployURL
} from "./workloads.route";
import { namespaceStore } from "compass-base/client/components/+namespaces/namespace.store";
import { Pods } from "../+workloads-pods";
import { Deployments } from "../+workloads-deployments";
import { DaemonSets } from "../+workloads-daemonsets";
import { EnhanceStatefulSets } from "../+workloads-enhancestatefulsets";
import { Jobs } from "../+workloads-jobs";
import { CronJobs } from "../+workloads-cronjobs";
import { Stones } from "../+workloads-stones";
import { Deploys } from "../+workloads-deploy";
import { StatefulSets } from "../+workloads-statefulsets";
import { Injectors } from "../+workloads-injectors";
import { Waters } from "../+workloads-waters"

interface Props extends RouteComponentProps {
}

@observer
export class Workloads extends React.Component<Props> {
  static get tabRoutes(): TabRoute[] {
    const query = namespaceStore.getContextParams();
    // const userConfig = store.get('u_config')
    // const isClusterAdmin = userConfig ? userConfig.isClusterAdmin : false
    return [
      {
        title: `Overview`,
        component: WorkloadsOverview,
        url: overviewURL({ query }),
        path: overviewRoute.path
      },
      {
        title: `Deploy`,
        component: Deploys,
        url: deployURL({ query }),
        path: deployRoute.path
      },
      {
        title: `Stones`,
        component: Stones,
        url: stonesURL({ query }),
        path: stonesRoute.path
      },
      {
        title: `StatefulSets*`,
        component: EnhanceStatefulSets,
        url: enhanceStatefulSetsURL({ query }),
        path: enhanceStatefulsetsRoute.path
      },
      {
        title: `Pods`,
        component: Pods,
        url: podsURL({ query }),
        path: podsRoute.path
      },
      {
        title: `Waters`,
        component: Waters,
        url: watersURL({ query }),
        path: watersRoute.path
      },
      {
        title: `Injectors`,
        component: Injectors,
        url: injectorURL({ query }),
        path: injectorsRoute.path
      },
      {
        title: `Deployments`,
        component: Deployments,
        url: deploymentsURL({ query }),
        path: deploymentsRoute.path,
      },
      {
        title: `DaemonSets`,
        component: DaemonSets,
        url: daemonSetsURL({ query }),
        path: daemonSetsRoute.path,
      },
      {
        title: `StatefulSets`,
        component: StatefulSets,
        url: statefulSetsURL({ query }),
        path: statefulSetsRoute.path,
      },
      {
        title: `Jobs`,
        component: Jobs,
        url: jobsURL({ query }),
        path: jobsRoute.path,
      },
      {
        title: `CronJobs`,
        component: CronJobs,
        url: cronJobsURL({ query }),
        path: cronJobsRoute.path,
      }
    ]
  };

  render() {
    const tabRoutes = Workloads.tabRoutes;
    return (
      <MainLayout className="Workloads" tabs={tabRoutes}>
        <Switch>
          {tabRoutes.map((route, index) => <Route key={index} {...route} />)}
          <Redirect to={workloadsURL({ query: namespaceStore.getContextParams() })} />
        </Switch>
      </MainLayout>
    )
  }
}