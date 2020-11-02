import { observable } from "mobx";
import { autobind } from "compass-base/client/utils";
import { KubeObjectStore } from "compass-base/client/kube-object.store";
import { Deployment, IPodMetrics, podsApi, ReplicaSet, replicaSetApi } from "compass-base/client/api/endpoints";
import { podsStore } from "../+workloads-pods/pods.store";
import { apiManager } from "compass-base/client/api/api-manager";

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
