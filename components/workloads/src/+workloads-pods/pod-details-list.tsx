import "./pod-details-list.scss";

import React from "react";
import kebabCase from "lodash/kebabCase";
import { disposeOnUnmount, observer } from "mobx-react";
import { podsStore } from "./pods.store";
import { Pod } from "compass-base/client/api/endpoints";
import { autobind, bytesToUnits, cssNames, interval, prevDefault } from "compass-base/client/utils";
import { KubeEventIcon } from "compass-base/client/components/+events/kube-event-icon";
import { LineProgress } from "compass-base/client/components/line-progress";
import { KubeObject } from "compass-base/client/api/kube-object";
import { Table, TableCell, TableHead, TableRow } from "compass-base/client/components/table";
import { showDetails } from "compass-base/client/navigation";
import { reaction } from "mobx";
import { Spinner } from "compass-base/client/components/spinner";
import { DrawerTitle } from "compass-base/client/components/drawer";

enum sortBy {
  name = "name",
  namespace = "namespace",
  cpu = "cpu",
  memory = "memory",
  node = "node",
  restart = "restart",
}

interface Props extends OptionalProps {
  pods: Pod[];
  owner: KubeObject;
}

interface OptionalProps {
  maxCpu?: number;
  maxMemory?: number;
  showTitle?: boolean;
}

@observer
export class PodDetailsList extends React.Component<Props> {
  static defaultProps: OptionalProps = {
    showTitle: true
  }

  private metricsWatcher = interval(120, () => {
    podsStore.loadKubeMetrics(this.props.owner.getNs());
  });

  private sortingCallbacks = {
    [sortBy.name]: (pod: Pod) => pod.getName(),
    [sortBy.namespace]: (pod: Pod) => pod.getNs(),
    [sortBy.cpu]: (pod: Pod) => podsStore.getPodKubeMetrics(pod).cpu,
    [sortBy.memory]: (pod: Pod) => podsStore.getPodKubeMetrics(pod).memory,
    [sortBy.node]: (pod: Pod) => pod.getNodeName(),
    [sortBy.restart]: (pod: Pod) => pod.getRestartsCount(),
  }

  componentDidMount() {
    this.metricsWatcher.start(true);
    disposeOnUnmount(this, [
      reaction(() => this.props.owner, () => this.metricsWatcher.restart(true))
    ])
  }

  componentWillUnmount() {
    this.metricsWatcher.stop();
  }

  renderCpuUsage(id: string, usage: number) {
    const { maxCpu } = this.props;
    const value = usage.toFixed(3);
    const tooltip = (
      <p>`CPU`: {Math.ceil(usage * 100) / maxCpu}%<br />{usage.toFixed(3)}</p>
    );
    if (!maxCpu) {
      if (parseFloat(value) === 0) return 0;
      return value;
    }
    return (
      <LineProgress
        max={maxCpu} value={usage}
        tooltip={parseFloat(value) !== 0 ? tooltip : null}
      />
    );
  }

  renderMemoryUsage(id: string, usage: number) {
    const { maxMemory } = this.props;
    const tooltip = (
      <p>`Memory`: {Math.ceil(usage * 100 / maxMemory)}%<br />{bytesToUnits(usage, 3)}</p>
    );
    if (!maxMemory) return usage ? bytesToUnits(usage) : 0;
    return (
      <LineProgress
        max={maxMemory} value={usage}
        tooltip={usage != 0 ? tooltip : null}
      />
    );
  }

  @autobind()
  getTableRow(uid: string) {
    const { pods } = this.props;
    const pod = pods.find(pod => pod.getId() == uid);
    const metrics = podsStore.getPodKubeMetrics(pod);
    return (
      <TableRow
        key={pod.getId()}
        sortItem={pod}
        nowrap
        onClick={prevDefault(() => showDetails(pod.selfLink, false))}
      >
        <TableCell className="name">{pod.getName()}</TableCell>
        <TableCell className="warning">{pod.hasIssues() && <KubeEventIcon object={pod} />}</TableCell>
        <TableCell className="namespace">{pod.getNs()}</TableCell>
        <TableCell className="cpu">{this.renderCpuUsage(`cpu-${pod.getId()}`, metrics.cpu)}</TableCell>
        <TableCell className="memory">{this.renderMemoryUsage(`memory-${pod.getId()}`, metrics.memory)}</TableCell>
        <TableCell className="node">{pod.getNodeName()}</TableCell>
        <TableCell className="restart">{pod.getRestartsCount()}</TableCell>
        <TableCell className={cssNames("status", kebabCase(pod.getStatusMessage()))}>{pod.getStatusMessage()}</TableCell>
      </TableRow>
    );
  }

  render() {
    const { pods, showTitle } = this.props;
    const virtual = pods.length > 100;
    if (!pods.length && !podsStore.isLoaded) return (
      <div className="PodDetailsList flex justify-center"><Spinner /></div>
    );
    if (!pods.length) return null;
    return (
      <div className="PodDetailsList flex column">
        {showTitle && <DrawerTitle title={`Pods`} />}
        <Table
          items={pods}
          selectable
          virtual={virtual}
          scrollable={false}
          sortable={this.sortingCallbacks}
          sortByDefault={{ sortBy: sortBy.cpu, orderBy: "desc" }}
          sortSyncWithUrl={false}
          getTableRow={this.getTableRow}
          className="box grow"
        >
          <TableHead>
            <TableCell className="name" sortBy={sortBy.name}>`Name`</TableCell>
            <TableCell className="warning" />
            <TableCell className="namespace" sortBy={sortBy.namespace}>Namespace</TableCell>
            <TableCell className="cpu" sortBy={sortBy.cpu}>`CPU`</TableCell>
            <TableCell className="memory" sortBy={sortBy.memory}>`Memory`</TableCell>
            <TableCell className="node" sortBy={sortBy.node}>`Node`</TableCell>
            <TableCell className="restart" sortBy={sortBy.node}>`restart`</TableCell>
            <TableCell className="status">`Status`</TableCell>
          </TableHead>
          {
            !virtual && pods.map(pod => this.getTableRow(pod.getId()))
          }
        </Table>
      </div>
    );
  }
}