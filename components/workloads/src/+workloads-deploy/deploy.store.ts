import {autobind} from "compass-base/client/utils";
import {KubeObjectStore} from "compass-base/client/kube-object.store";
import {deployApi} from "compass-base/client/api/endpoints";
import {apiManager} from "compass-base/client/api/api-manager";
import {Deploy} from "compass-base/client/api/endpoints";

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
