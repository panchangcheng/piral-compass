import { observable } from "mobx";
import { autobind } from "@pskishere/piral-compass-utils";
import { KubeObjectStore, IPodMetrics, podsApi, PodStatus, Water, waterApi, apiManager } from "@pskishere/piral-compass-api";
import { podsStore } from "../+workloads-pods/pods.store";

@autobind()
export class WaterStore extends KubeObjectStore<Water> {
  api = waterApi
  @observable metrics: IPodMetrics = null;

  loadMetrics(water: Water) {
    const pods = this.getChildPods(water);
    return podsApi.getMetrics(pods, water.getNs(), "").then(metrics =>
      this.metrics = metrics
    );
  }

  // getChildEnhanceStatefulset(water: Water) {
  //   return enhanceStatefulSetStore
  //     .getEnhanceStatefulSetByOwner(stone)
  //     .filter(enhanceStatefulset => enhanceStatefulset.getNs() === stone.getNs())
  // }

  getChildPods(water: Water) {
    return podsStore
      .getByLabel(water.getTemplateLabels())
      .filter(pod => pod.getNs() === water.getNs())
  }

  getStatuses(waters: Water[]) {
    const status = { failed: 0, pending: 0, running: 0 }
    waters.forEach(waters => {
      const pods = this.getChildPods(waters)
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

export const waterStore = new WaterStore();
apiManager.registerStore(waterApi, waterStore);
