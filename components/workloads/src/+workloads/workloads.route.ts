import {RouteProps} from "react-router"
import {Workloads} from "./workloads";
import {buildURL, IURLParams} from "compass-base/client/navigation";

export const workloadsRoute: RouteProps = {
  get path() {
    return Workloads.tabRoutes.map((path) => path).flat()
  }
}

// Routes
export const overviewRoute: RouteProps = {
  path: "/workloads"
}
export const podsRoute: RouteProps = {
  path: "/pods"
}
export const deploymentsRoute: RouteProps = {
  path: "/deployments"
}
export const daemonSetsRoute: RouteProps = {
  path: "/daemonsets"
}
export const statefulSetsRoute: RouteProps = {
  path: "/statefulsets"
}
export const jobsRoute: RouteProps = {
  path: "/jobs"
}
export const cronJobsRoute: RouteProps = {
  path: "/cronjobs"
}

export const stonesRoute: RouteProps = {
  path: "/stones"
}

export const enhanceStatefulsetsRoute: RouteProps = {
  path: "/enhancestatefulsets"
}

export const injectorsRoute: RouteProps = {
  path: "/injectors"
}

export const watersRoute: RouteProps = {
  path: "/waters"
}

export const deployRoute: RouteProps = {
  path: "/deploy"
}

// Route params
export interface IDeployWorkloadsParams {
}

// Route params
export interface IWorkloadsOverviewRouteParams {
}

export interface IPodsRouteParams {
}

export interface IDeploymentsRouteParams {
}

export interface IDaemonSetsRouteParams {
}

export interface IStatefulSetsRouteParams {
}

export interface InjectorsRouteParams {
}

export interface IWatersRouteParams {
}

export interface IEnhanceStatefulSetsRouteParams {
}

export interface IJobsRouteParams {
}

export interface ICronJobsRouteParams {
}

export interface IStonesRouteParams {
}

// URL-builders
export const workloadsURL = (params?: IURLParams) => overviewURL(params);
export const overviewURL = buildURL<IWorkloadsOverviewRouteParams>(overviewRoute.path)
export const podsURL = buildURL<IPodsRouteParams>(podsRoute.path)
export const deploymentsURL = buildURL<IDeploymentsRouteParams>(deploymentsRoute.path)
export const daemonSetsURL = buildURL<IDaemonSetsRouteParams>(daemonSetsRoute.path)
export const statefulSetsURL = buildURL<IStatefulSetsRouteParams>(statefulSetsRoute.path)
export const jobsURL = buildURL<IJobsRouteParams>(jobsRoute.path)
export const cronJobsURL = buildURL<ICronJobsRouteParams>(cronJobsRoute.path)
export const stonesURL = buildURL<IStonesRouteParams>(stonesRoute.path)
export const enhanceStatefulSetsURL = buildURL<IEnhanceStatefulSetsRouteParams>(enhanceStatefulsetsRoute.path)
export const injectorURL = buildURL<InjectorsRouteParams>(injectorsRoute.path)
export const watersURL = buildURL<IWatersRouteParams>(watersRoute.path)
export const deployURL = buildURL<IDeployWorkloadsParams>(deployRoute.path)