import { observable } from "mobx";
import { autobind,  } from "@pskishere/piral-compass-utils";
import { KubeObjectStore, IPodMetrics, podsApi, PodStatus, StatefulSet, statefulSetApi, apiManager } from "@pskishere/piral-compass-api";
import { podsStore } from "../+workloads-pods/pods.store";

@autobind()
export class StatefulSetStore extends KubeObjectStore<StatefulSet> {
  api = statefulSetApi
  @observable metrics: IPodMetrics = null;

  loadMetrics(statefulSet: StatefulSet) {
    const pods = this.getChildPods(statefulSet);
    return podsApi.getMetrics(pods, statefulSet.getNs(), "").then(metrics =>
      this.metrics = metrics
    );
  }

  getChildPods(statefulSet: StatefulSet) {
    return podsStore.getPodsByOwner(statefulSet)
  }

  getStatuses(statefulSets: StatefulSet[]) {
    const status = { failed: 0, pending: 0, running: 0 }
    statefulSets.forEach(statefulSet => {
      const pods = this.getChildPods(statefulSet)
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

export const statefulSetStore = new StatefulSetStore();
apiManager.registerStore(statefulSetApi, statefulSetStore);
