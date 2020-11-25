import { observable } from "mobx";
import { autobind } from "@pskishere/piral-compass-utils";
import { KubeObjectStore, Deployment, IPodMetrics, podsApi, ReplicaSet, replicaSetApi, apiManager } from "@pskishere/piral-compass-api";
import { podsStore } from "../+workloads-pods/pods.store";

@autobind()
export class ReplicaSetStore extends KubeObjectStore<ReplicaSet> {
  api = replicaSetApi
  @observable metrics: IPodMetrics = null;

  loadMetrics(replicaSet: ReplicaSet) {
    const pods = this.getChildPods(replicaSet);
    return podsApi.getMetrics(pods, replicaSet.getNs(), "").then(metrics =>
      this.metrics = metrics
    );
  }

  getChildPods(replicaSet: ReplicaSet) {
    return podsStore.getPodsByOwner(replicaSet);
  }

  getReplicaSetsByOwner(deployment: Deployment) {
    return this.items.filter(replicaSet =>
      !!replicaSet.getOwnerRefs().find(owner => owner.uid === deployment.getId())
    )
  }

  reset() {
    this.metrics = null;
  }
}

export const replicaSetStore = new ReplicaSetStore();
apiManager.registerStore(replicaSetApi, replicaSetStore);
