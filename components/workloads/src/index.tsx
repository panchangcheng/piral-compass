import * as React from 'react';
import { PiletApi } from 'compass-shell';
import {Jobs} from "./+workloads-jobs";
import {Pods} from "./+workloads-pods";
import {Icon} from "compass-base/client/components/icon";
import {SidebarNavItem} from "compass-base/client/components/layout/sidebar";
import {workloadsURL, workloadsRoute, Workloads, overviewRoute} from "./+workloads";
import { namespaceStore } from "compass-base/client/components/+namespaces/namespace.store";
import {WorkloadsOverview} from "./+workloads-overview/overview";
import {Deploys} from "./+workloads-deploy";
import {Stones} from "./+workloads-stones";
import {StatefulSets} from "./+workloads-statefulsets";
import {EnhanceStatefulSets} from "./+workloads-enhancestatefulsets";
import {Waters} from "./+workloads-waters";
import {Injectors} from "./+workloads-injectors";
import {Deployments} from "./+workloads-deployments";
import {DaemonSets} from "./+workloads-daemonsets";
import {CronJobs} from "./+workloads-cronjobs";

export function setup(app: PiletApi) {
  app.showNotification('Hello from Piral!', {
    autoClose: 2000,
  });
  app.registerMenu(() => {
    const query = namespaceStore.getContextParams();
    return (
      <SidebarNavItem
        id="workloads"
        url={workloadsURL({ query })}
        routePath={workloadsRoute.path}
        subMenus={Workloads.tabRoutes}
        text={`Workloads`}
        icon={<Icon svg="workloads"/>}
      />
    )
    }
  );
  app.registerPage('/workloads', WorkloadsOverview)
  app.registerPage('/deploy', Deploys)
  app.registerPage('/stones', Stones)
  app.registerPage('/enhancestatefulsets', EnhanceStatefulSets)
  app.registerPage('/pods', Pods)
  app.registerPage('/waters', Waters)
  app.registerPage('/injectors', Injectors)
  app.registerPage('/statefulsets', StatefulSets)
  app.registerPage('/deployments', Deployments)
  app.registerPage('/daemonsets', DaemonSets)
  app.registerPage('/jobs', Jobs)
  app.registerPage('/cronjobs', CronJobs)
}
