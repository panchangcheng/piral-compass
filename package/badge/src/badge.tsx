import "./badge.scss"

import * as React from "react";
import { cssNames } from "piral-compass-utils";
import { TooltipDecoratorProps, withTooltip } from "piral-compass-tooltip";

interface Props extends React.HTMLAttributes<any>, TooltipDecoratorProps {
  label: React.ReactNode;
  small?: boolean;
}

@withTooltip
export class Badge extends React.Component<Props> {
  render() {
    const { className, label, small, children, ...elemProps } = this.props;
    return (
      <span className={cssNames("Badge", { small }, className)} {...elemProps}>
        {label}
        {children}
      </span>
    );
  }
}
