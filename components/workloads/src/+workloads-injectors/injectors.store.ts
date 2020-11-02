import { observable } from "mobx";
import { autobind } from "compass-base/client/utils";
import { KubeObjectStore } from "compass-base/client/kube-object.store";
import { injectorApi } from "compass-base/client/api/endpoints";
import { apiManager } from "compass-base/client/api/api-manager";
import { Injector } from "compass-base/client/api/endpoints";

@autobind()
export class InjectorsStore extends KubeObjectStore<Injector> {
  api = injectorApi

  getInjector(injector: Injector) {
    return injectorStore.items.find(item =>
      item.getName() === injector.getName() &&
      item.getNs() === injector.getNs()
    )
  }

  reset() {
  }
}

export const injectorStore = new InjectorsStore();
apiManager.registerStore(injectorApi, injectorStore);
