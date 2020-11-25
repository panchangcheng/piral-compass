import {autobind} from "@pskishere/piral-compass-utils";
import {KubeObjectStore, deployApi, Deploy, apiManager} from "@pskishere/piral-compass-api";

@autobind()
export class DeployStore extends KubeObjectStore<Deploy> {
  api = deployApi

  getInjector(deploy: Deploy) {
    return deployStore.items.find(item =>
      item.getName() === deploy.getName() &&
      item.getNs() === deploy.getNs()
    )
  }

  reset() {
  }
}

export const deployStore = new DeployStore();
apiManager.registerStore(deployApi, deployStore);
