import { RouteProps } from "react-router"
import { buildURL } from "@pskishere/piral-compass-utils";

export const namespacesRoute: RouteProps = {
  path: "/namespaces"
}

export interface INamespacesRouteParams {
}

export const namespacesURL = buildURL<INamespacesRouteParams>(namespacesRoute.path)
