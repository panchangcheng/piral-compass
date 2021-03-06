import { action, observable, reaction } from "mobx";
import { autobind, createStorage } from "@pskishere/piral-compass-utils";
import { Namespace, namespacesApi, KubeObjectStore } from "@pskishere/piral-compass-api";
import { IQueryParams, navigation, setQueryParams } from "@pskishere/piral-compass-utils";

@autobind()
export class NamespaceStore extends KubeObjectStore<Namespace> {
  api = namespacesApi;
  contextNs = observable.array<string>();

  protected storage = createStorage<string[]>("context_ns", this.contextNs);

  get initNamespaces() {
    const fromUrl = navigation.searchParams.getAsArray("namespaces");
    return fromUrl.length ? fromUrl : this.storage.get();
  }

  constructor() {
    super();

    // restore context namespaces
    const { initNamespaces: namespaces } = this;
    this.setContext(namespaces);
    this.updateUrl(namespaces);

    // sync with local-storage & url-search-params
    reaction(() => this.contextNs.toJS(), namespaces => {
      this.storage.set(namespaces);
      this.updateUrl(namespaces);
    });
  }

  getContextParams(): Partial<IQueryParams> {
    return {
      namespaces: this.contextNs
    }
  }

  protected updateUrl(namespaces: string[]) {
    setQueryParams({ namespaces }, { replace: true })
  }

  // protected loadItems(namespaces?: string[]) {
  //   if (namespaces) {
  //     return Promise.all(namespaces.map(name => this.api.get({ name })))
  //   }
  //   else {
  //     return super.loadItems();
  //   }
  // }

  setContext(namespaces: string[]) {
    this.contextNs.replace(namespaces);
  }

  hasContext(namespace: string | string[]) {
    const context = Array.isArray(namespace) ? namespace : [namespace];
    return context.every(namespace => this.contextNs.includes(namespace));
  }

  toggleContext(namespace: string) {
    if (this.hasContext(namespace)) this.contextNs.remove(namespace);
    else this.contextNs.push(namespace);
  }

  getAllOpsNamespace(): string[] {
    return this.items.map(item => { if (item.getName().indexOf("-ops") > 0) { return item.getName() } }).slice();
  }

  @action
  reset() {
    super.reset();
    this.contextNs.clear();
  }
}

export const namespaceStore = new NamespaceStore();
