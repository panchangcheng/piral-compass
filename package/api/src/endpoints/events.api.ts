import moment from "moment";
import { KubeObject } from "../kube-object";
import { autobind, formatDuration} from "piral-compass-utils";
import { KubeApi } from "../kube-api";

@autobind()
export class KubeEvent extends KubeObject {
  static kind = "Event"

  involvedObject: {
    kind: string;
    namespace: string;
    name: string;
    uid: string;
    apiVersion: string;
    resourceVersion: string;
    fieldPath: string;
  }
  reason: string
  message: string
  source: {
    component: string;
    host: string;
  }
  firstTimestamp: string
  lastTimestamp: string
  count: number
  type: string
  eventTime: null
  reportingComponent: string
  reportingInstance: string

  isWarning() {
    return this.type === "Warning";
  }

  getSource() {
    const { component, host } = this.source
    return `${component} ${host || ""}`
  }

  getFirstSeenTime() {
    const diff = moment().diff(this.firstTimestamp)
    return formatDuration(diff, true)
  }

  getLastSeenTime() {
    const diff = moment().diff(this.lastTimestamp)
    return formatDuration(diff, true)
  }
}

export const eventApi = new KubeApi({
  kind: KubeEvent.kind,
  apiBase: "/api/v1/events",
  isNamespaced: true,
  objectConstructor: KubeEvent,
})
