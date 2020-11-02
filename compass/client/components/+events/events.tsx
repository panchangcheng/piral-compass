import "./events.scss";

import React from "react";
import { observer } from "mobx-react";
import { MainLayout } from "../layout/main-layout";
import { eventStore } from "./event.store";
import { KubeObjectListLayout, KubeObjectListLayoutProps } from "../kube-object";
import { KubeEvent } from "../../api/endpoints/events.api";
import { Tooltip, TooltipContent } from "../tooltip";
import { Link } from "react-router-dom";
import { cssNames, IClassName, stopPropagation } from "../../utils";
import { Icon } from "../icon";
import { getDetailsUrl } from "../../navigation";
import { lookupApiLink } from "../../api/kube-api";

enum sortBy {
  namespace = "namespace",
  object = "object",
  type = "type",
  count = "count",
  age = "age",
}

interface Props extends Partial<KubeObjectListLayoutProps> {
  className?: IClassName;
  compact?: boolean;
  compactLimit?: number;
}

const defaultProps: Partial<Props> = {
  compactLimit: 10,
};

@observer
export class Events extends React.Component<Props> {
  static defaultProps = defaultProps as object;

  render() {
    const { compact, compactLimit, className, ...layoutProps } = this.props;
    const events = (
      <KubeObjectListLayout
        {...layoutProps}
        className={cssNames("Events", className, { compact })}
        store={eventStore}
        isSelectable={false}
        sortingCallbacks={{
          [sortBy.namespace]: (event: KubeEvent) => event.getNs(),
          [sortBy.type]: (event: KubeEvent) => event.involvedObject.kind,
          [sortBy.object]: (event: KubeEvent) => event.involvedObject.name,
          [sortBy.count]: (event: KubeEvent) => event.count,
          [sortBy.age]: (event: KubeEvent) => event.getAge(false),
        }}
        searchFilters={[
          (event: KubeEvent) => event.getSearchFields(),
          (event: KubeEvent) => event.message,
          (event: KubeEvent) => event.getSource(),
          (event: KubeEvent) => event.involvedObject.name,
        ]}
        renderHeaderTitle={`Events`}
        customizeHeader={({ title, info }) => (
          compact ? title : ({
            info: (
              <>
                {info}
                <Icon
                  small
                  material="help_outline"
                  className="help-icon"
                  tooltip={`Limited to {eventStore.limit}`}
                />
              </>
            )
          })
        )}
        renderTableHeader={[
          { title: `Message`, className: "message" },
          { title: `Namespace`, className: "namespace", sortBy: sortBy.namespace },
          { title: `Type`, className: "type", sortBy: sortBy.type },
          { title: `Involved Object`, className: "object", sortBy: sortBy.object },
          { title: `Source`, className: "source" },
          { title: `Count`, className: "count", sortBy: sortBy.count },
          { title: `Age`, className: "age", sortBy: sortBy.age },
        ]}
        renderTableContents={(event: KubeEvent) => {
          const { involvedObject, type, message } = event;
          const { kind, name } = involvedObject;
          const tooltipId = `message-${event.getId()}`;
          const isWarning = type === "Warning";
          const detailsUrl = getDetailsUrl(lookupApiLink(involvedObject, event));
          return [
            {
              className: {
                warning: isWarning
              },
              title: (
                <>
                  <span id={tooltipId}>{message}</span>
                  <Tooltip htmlFor={tooltipId} following>
                    <TooltipContent narrow warning={isWarning}>
                      {message}
                    </TooltipContent>
                  </Tooltip>
                </>
              )
            },
            event.getNs(),
            kind,
            <Link to={detailsUrl} title={name} onClick={stopPropagation}>{name}</Link>,
            event.getSource(),
            event.count,
            event.getAge(),
          ]
        }}
        virtual={!compact}
        filterItems={[
          items => compact ? items.slice(0, compactLimit) : items,
        ]}
      />
    )
    if (compact) {
      return events;
    }
    return (
      <MainLayout>
        {events}
      </MainLayout>
    )
  }
}
