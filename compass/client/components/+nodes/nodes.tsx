import "./nodes.scss";

import * as React from "react";
import { observer } from "mobx-react";
import { RouteComponentProps } from "react-router";
import { cssNames, interval } from "../../utils";
import { MainLayout } from "../layout/main-layout";
import { nodesStore } from "./nodes.store";
import { KubeObjectListLayout } from "../kube-object";
import { INodesRouteParams } from "./nodes.route";
import { Node, nodesApi } from "../../api/endpoints/nodes.api";
import { NodeMenu } from "./node-menu";
import { LineProgress } from "../line-progress";
import { bytesToUnits } from "../../utils/convertMemory";
import { Tooltip, TooltipContent } from "../tooltip";
import kebabCase from "lodash/kebabCase";
import upperFirst from "lodash/upperFirst";
import { apiManager } from "../../api/api-manager";
import {NodeAnnotationDialog} from "./node-annotation-dialog";

enum sortBy {
  name = "name",
  cpu = "cpu",
  memory = "memory",
  disk = "disk",
  conditions = "condition",
  taints = "taints",
  roles = "roles",
  age = "age",
  version = "version",
  status = "status",
}

interface Props extends RouteComponentProps<INodesRouteParams> {
}

@observer
export class Nodes extends React.Component<Props> {
  private metricsWatcher = interval(30, () => nodesStore.loadUsageMetrics());

  componentDidMount() {
    this.metricsWatcher.start(true);
    // *******HC WIP ******* // 
    // new NodeZoneGraph(1000,350); WIP
  }

  componentWillUnmount() {
    this.metricsWatcher.stop();
  }

  renderCpuUsage(node: Node) {
    const metrics = nodesStore.getLastMetricValues(node, ["cpuUsage", "cpuCapacity"]);
    if (!metrics || !metrics[1]) return <LineProgress value={0}/>;
    const usage = metrics[0];
    const cores = metrics[1];
    return (
      <LineProgress
        max={cores}
        value={usage}
        tooltip={`CPU:` + ` ${Math.ceil(usage * 100) / cores}\%, ` + `cores:` + ` ${cores}`}
      />
    )
  }

  renderMemoryUsage(node: Node) {
    const metrics = nodesStore.getLastMetricValues(node, ["memoryUsage", "memoryCapacity"]);
    if (!metrics || !metrics[1]) return <LineProgress value={0}/>;
    const usage = metrics[0];
    const capacity = metrics[1];
    return (
      <LineProgress
        max={capacity}
        value={usage}
        tooltip={`Memory:` + ` ${Math.ceil(usage * 100 / capacity)}%, ${bytesToUnits(usage, 3)}`}
      />
    )
  }

  renderDiskUsage(node: Node): any {
    const metrics = nodesStore.getLastMetricValues(node, ["fsUsage", "fsSize"]);
    if (!metrics || !metrics[1]) return <LineProgress value={0}/>;
    const usage = metrics[0];
    const capacity = metrics[1];
    return (
      <LineProgress
        max={capacity}
        value={usage}
        tooltip={`Disk:` + ` ${Math.ceil(usage * 100 / capacity)}%, ${bytesToUnits(usage, 3)}`}
      />
    )
  }

  renderConditions(node: Node) {
    if (!node.status.conditions) {
      return null
    }
    const conditions = node.getActiveConditions();
    return conditions.map(condition => {
      const { type } = condition
      const tooltipId = `node-${node.getName()}-condition-${type}`
      return (
        <div key={type} id={tooltipId} className={cssNames("condition", kebabCase(type))}>
          {type}
          <Tooltip htmlFor={tooltipId} following>
            <TooltipContent tableView>
              {Object.entries(condition).map(([key, value]) =>
                <div key={key} className="flex gaps align-center">
                  <div className="name">{upperFirst(key)}</div>
                  <div className="value">{value}</div>
                </div>
              )}
            </TooltipContent>
          </Tooltip>
        </div>)
    })
  }

  render() {
    return (
      <MainLayout>
        {/* // *******HC WIP ******* //  */}
        {/* <div className={cssNames("node-zone-graph", themeStore.activeTheme.type)}>
          <h5>节点分布图</h5>
          <div id="node-zone-graph"> </div>
        </div> */}
        <KubeObjectListLayout
          className={cssNames("Nodes mt-10")}
          store={nodesStore} isClusterScoped
          isReady={nodesStore.isLoaded && nodesStore.metricsLoaded}
          // dependentStores={[podsStore]}
          isSelectable={false}
          sortingCallbacks={{
            [sortBy.name]: (node: Node) => node.getName(),
            [sortBy.cpu]: (node: Node) => nodesStore.getLastMetricValues(node, ["cpuUsage"]),
            [sortBy.memory]: (node: Node) => nodesStore.getLastMetricValues(node, ["memoryUsage"]),
            [sortBy.disk]: (node: Node) => nodesStore.getLastMetricValues(node, ["fsUsage"]),
            [sortBy.conditions]: (node: Node) => node.getNodeConditionText(),
            [sortBy.taints]: (node: Node) => node.getTaints().length,
            [sortBy.roles]: (node: Node) => node.getRoleLabels(),
            [sortBy.age]: (node: Node) => node.getAge(false),
            [sortBy.version]: (node: Node) => node.getKubeletVersion(),
          }}
          searchFilters={[
            (node: Node) => node.getSearchFields(),
            (node: Node) => node.getRoleLabels(),
            (node: Node) => node.getKubeletVersion(),
            (node: Node) => node.getNodeConditionText(),
          ]}
          renderHeaderTitle={`Nodes`}
          renderTableHeader={[
            { title: `Name`, className: "name", sortBy: sortBy.name },
            { title: `CPU`, className: "cpu", sortBy: sortBy.cpu },
            { title: `Memory`, className: "memory", sortBy: sortBy.memory },
            { title: `Disk`, className: "disk", sortBy: sortBy.disk },
            { title: `Taints`, className: "taints", sortBy: sortBy.taints },
            { title: `Roles`, className: "roles", sortBy: sortBy.roles },
            { title: `Version`, className: "version", sortBy: sortBy.version },
            { title: `Age`, className: "age", sortBy: sortBy.age },
            { title: `Conditions`, className: "conditions", sortBy: sortBy.conditions },
          ]}
          renderTableContents={(node: Node) => {
            const tooltipId = `node-taints-${node.getId()}`;
            return [
              node.getName(),
              this.renderCpuUsage(node),
              this.renderMemoryUsage(node),
              this.renderDiskUsage(node),
              <>
                <span id={tooltipId}>{node.getTaints().length}</span>
                <Tooltip htmlFor={tooltipId} style={{ whiteSpace: "pre-line" }}>
                  {node.getTaints().map(({ key, effect }) => `${key}: ${effect}.join('\n')`)}
                </Tooltip>
              </>,
              node.getRoleLabels(),
              node.status.nodeInfo.kubeletVersion,
              node.getAge(),
              this.renderConditions(node),
            ]
          }}
          renderItemMenu={(item: Node) => {
            return <NodeMenu object={item}/>
          }}
        />
        <NodeAnnotationDialog />
      </MainLayout>
    )
  }
}

apiManager.registerViews(nodesApi, {
  Menu: NodeMenu,
});
