import React from "react";
import { Icon } from "piral-compass-icon";

export function NoMetrics() {
  return (
    <div className="flex justify-center align-center">
      <Icon material="info"/>&nbsp;Metrics not available at the moment
    </div>
  );
}