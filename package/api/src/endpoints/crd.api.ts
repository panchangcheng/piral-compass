import { KubeObject } from "../kube-object";
import { KubeApi } from "../kube-api";
import { RouteProps } from "react-router";
import { buildURL } from "piral-compass-utils";

export const crdRoute: RouteProps = {
  path: "/crd"
}

export const crdDefinitionsRoute: RouteProps = {
  path: crdRoute.path + "/definitions"
}

export const crdResourcesRoute: RouteProps = {
  path: crdRoute.path + "/:group/:name"
}

export interface ICRDListQuery {
  groups?: string;
}

export interface ICRDRouteParams {
  group: string;
  name: string;
}

export const crdURL = buildURL<{}, ICRDListQuery>(crdDefinitionsRoute.path);
export const crdResourcesURL = buildURL<ICRDRouteParams>(crdResourcesRoute.path);

export class CustomResourceDefinition extends KubeObject {
  static kind = "CustomResourceDefinition";

  spec: {
    group: string;
    version: string;
    names: {
      plural: string;
      singular: string;
      kind: string;
      listKind: string;
    };
    scope: "Namespaced" | "Cluster" | string;
    validation?: any;
    versions: {
      name: string;
      served: boolean;
      storage: boolean;
    }[];
    conversion: {
      strategy?: string;
      webhook?: any;
    };
    additionalPrinterColumns?: {
      name: string;
      type: "integer" | "number" | "string" | "boolean" | "date";
      priority: number;
      description: string;
      JSONPath: string;
    }[];
  }
  status: {
    conditions: {
      lastTransitionTime: string;
      message: string;
      reason: string;
      status: string;
      type: string;
    }[];
    acceptedNames: {
      plural: string;
      singular: string;
      kind: string;
      shortNames: string[];
      listKind: string;
    };
    storedVersions: string[];
  }

  getResourceUrl() {
    return crdResourcesURL({
      params: {
        group: this.getGroup(),
        name: this.getPluralName(),
      }
    })
  }

  getResourceApiBase() {
    const { version, group } = this.spec;
    return `/apis/${group}/${version}/${this.getPluralName()}`
  }

  getPluralName() {
    return this.getNames().plural
  }

  getResourceKind() {
    return this.spec.names.kind
  }

  getResourceTitle() {
    const name = this.getPluralName();
    return name[0].toUpperCase() + name.substr(1)
  }

  getGroup() {
    return this.spec.group;
  }

  getScope() {
    return this.spec.scope;
  }

  getVersion() {
    return this.spec.version;
  }

  isNamespaced() {
    return this.getScope() === "Namespaced";
  }

  getStoredVersions() {
    return this.status.storedVersions.join(", ");
  }

  getNames() {
    return this.spec.names;
  }

  getConversion() {
    return JSON.stringify(this.spec.conversion);
  }

  getPrinterColumns(ignorePriority = true) {
    const columns = this.spec.additionalPrinterColumns || [];
    return columns
      .filter(column => column.name != "Age")
      .filter(column => ignorePriority ? true : !column.priority);
  }

  getValidation() {
    return JSON.stringify(this.spec.validation, null, 2);
  }

  getConditions() {
    if (!this.status.conditions) return [];
    return this.status.conditions.map(condition => {
      const { message, reason, lastTransitionTime, status } = condition;
      return {
        ...condition,
        isReady: status === "True",
        tooltip: `${message || reason} (${lastTransitionTime})`
      }
    });
  }
}

export const crdApi = new KubeApi<CustomResourceDefinition>({
  kind: CustomResourceDefinition.kind,
  apiBase: "/apis/apiextensions.k8s.io/v1beta1/customresourcedefinitions",
  isNamespaced: false,
  objectConstructor: CustomResourceDefinition,
});
