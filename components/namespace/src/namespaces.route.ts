import { RouteProps } from "react-router"
import { buildURL } from "compass-base/client/navigation";

export const namespacesRoute: RouteProps = {
  path: "/namespaces"
}

export interface INamespacesRouteParams {
}

export const namespacesURL = buildURL<INamespacesRouteParams>(namespacesRoute.path)
