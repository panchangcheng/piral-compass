import "./replicasets.scss";

import React from "react";
import { observer } from "mobx-react";
import { ReplicaSet, replicaSetApi } from "compass-base/client/api/endpoints";
import { KubeObjectMenu, KubeObjectMenuProps } from "compass-base/client/components/kube-object/kube-object-menu";
import { replicaSetStore } from "./replicasets.store";
import { Spinner } from "compass-base/client/components/spinner";
import { prevDefault, stopPropagation } from "compass-base/client/utils";
import { DrawerTitle } from "compass-base/client/components/drawer";
import { Table, TableCell, TableHead, TableRow } from "compass-base/client/components/table";
import { showDetails } from "compass-base/client/navigation";
import { apiManager } from "compass-base/client/api/api-manager";

enum sortBy {
  name = "name",
  namespace = "namespace",
  pods = "pods",
  age = "age",
}

interface Props {
  replicaSets: ReplicaSet[];
}

@observer
export class ReplicaSets extends React.Component<Props> {
  private sortingCallbacks = {
    [sortBy.name]: (replicaSet: ReplicaSet) => replicaSet.getName(),
    [sortBy.namespace]: (replicaSet: ReplicaSet) => replicaSet.getNs(),
    [sortBy.age]: (replicaSet: ReplicaSet) => replicaSet.getAge(false),
    [sortBy.pods]: (replicaSet: ReplicaSet) => this.getPodsLength(replicaSet),
  }

  getPodsLength(replicaSet: ReplicaSet) {
    return replicaSetStore.getChildPods(replicaSet).length;
  }

  render() {
    const { replicaSets } = this.props;
    if (!replicaSets.length && !replicaSetStore.isLoaded) return (
      <div className="ReplicaSets"><Spinner center/></div>
    );
    if (!replicaSets.length) return null;
    return (
      <div className="ReplicaSets flex column">
        <DrawerTitle title={`Deploy Revisions`}/>
        <Table
          selectable
          scrollable={false}
          sortable={this.sortingCallbacks}
          sortByDefault={{ sortBy: sortBy.pods, orderBy: "desc" }}
          sortSyncWithUrl={false}
          className="box grow"
        >
          <TableHead>
            <TableCell className="name" sortBy={sortBy.name}>`Name`</TableCell>
            <TableCell className="namespace" sortBy={sortBy.namespace}>Namespace</TableCell>
            <TableCell className="pods" sortBy={sortBy.pods}>`Pods`</TableCell>
            <TableCell className="age" sortBy={sortBy.age}>`Age`</TableCell>
            <TableCell className="actions"/>
          </TableHead>
          {
            replicaSets.map(replica => {
              return (
                <TableRow
                  key={replica.getId()}
                  sortItem={replica}
                  nowrap
                  onClick={prevDefault(() => showDetails(replica.selfLink, false))}
                >
                  <TableCell className="name">{replica.getName()}</TableCell>
                  <TableCell className="namespace">{replica.getNs()}</TableCell>
                  <TableCell className="pods">{this.getPodsLength(replica)}</TableCell>
                  <TableCell className="age">{replica.getAge()}</TableCell>
                  <TableCell className="actions" onClick={stopPropagation}>
                    <ReplicaSetMenu object={replica}/>
                  </TableCell>
                </TableRow>
              )
            })
          }
        </Table>
      </div>
    );
  }
}

export function ReplicaSetMenu(props: KubeObjectMenuProps<ReplicaSet>) {
  return (
    <KubeObjectMenu {...props}/>
  )
}

apiManager.registerViews(replicaSetApi, {
  Menu: ReplicaSetMenu,
});