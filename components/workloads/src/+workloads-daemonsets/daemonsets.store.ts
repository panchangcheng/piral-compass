import { observable } from "mobx";
import { DaemonSet, daemonSetApi, IPodMetrics, Pod, podsApi, PodStatus, apiManager, KubeObjectStore } from "@pskishere/piral-compass-api";
import { autobind } from "@pskishere/piral-compass-utils";
import { podsStore } from "../+workloads-pods/pods.store";

@autobind()
export class DaemonSetStore extends KubeObjectStore<DaemonSet> {
  api = daemonSetApi

  @observable metrics: IPodMetrics = null;

  loadMetrics(daemonSet: DaemonSet) {
    const pods = this.getChildPods(daemonSet);
    return podsApi.getMetrics(pods, daemonSet.getNs(), "").then(metrics =>
      this.metrics = metrics
    );
  }

  getChildPods(daemonSet: DaemonSet): Pod[] {
    return podsStore.getPodsByOwner(daemonSet)
  }

  getStatuses(daemonSets?: DaemonSet[]) {
    const status = { failed: 0, pending: 0, running: 0 }
    daemonSets.forEach(daemonSet => {
      const pods = this.getChildPods(daemonSet)
      if (pods.some(pod => pod.getStatus() === PodStatus.FAILED)) {
        status.failed++
      }
      else if (pods.some(pod => pod.getStatus() === PodStatus.PENDING)) {
        status.pending++
      }
      else {
        status.running++
      }
    })
    return status
  }

  reset() {
    this.metrics = null;
  }
}

export const daemonSetStore = new DaemonSetStore();
apiManager.registerStore(daemonSetApi, daemonSetStore);
