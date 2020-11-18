import React from "react";
import { IPodMetrics } from "piral-compass-api";
import { getMetricLastPoints, IMetrics } from "piral-compass-api/src/endpoints/metrics.api";
import { bytesToUnits } from "piral-compass-utils";
import { Badge } from "piral-compass-badge";
import { DrawerItem } from "../../drawer";

interface Props {
  metrics: IPodMetrics<IMetrics>;
}

export function ResourceMetricsText(props: Props) {
  if (!props.metrics) return null
  const metrics = getMetricLastPoints(props.metrics);
  const { cpuUsage, cpuRequests, cpuLimits, memoryUsage, memoryRequests, memoryLimits } = metrics;
  return (
    <>
      <DrawerItem name={`CPU`} labelsOnly>
        {cpuUsage > 0 && <Badge label={`Usage: ${cpuUsage.toPrecision(2)}`}/>}
        {cpuRequests > 0 && <Badge label={`Requests: ${cpuRequests.toPrecision(2)}`}/>}
        {cpuLimits > 0 && <Badge label={`Limits: ${cpuLimits.toPrecision(2)}`}/>}
      </DrawerItem>
      <DrawerItem name={`Memory`} labelsOnly>
        {memoryUsage > 0 && <Badge label={`Usage: ${bytesToUnits(memoryUsage)}`}/>}
        {memoryRequests > 0 && <Badge label={`Requests: ${bytesToUnits(memoryRequests)}`}/>}
        {memoryLimits > 0 && <Badge label={`Limits: ${bytesToUnits(memoryLimits)}`}/>}
      </DrawerItem>
    </>
  );
}