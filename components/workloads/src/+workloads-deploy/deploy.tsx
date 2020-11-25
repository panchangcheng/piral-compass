import "./deploy.store.ts";

import React from "react";
import { observer } from "mobx-react";
import Tooltip from "@material-ui/core/Tooltip";
import { RouteComponentProps } from "react-router";
import { MenuItem } from "@pskishere/piral-compass-menu";
import { Icon } from "@pskishere/piral-compass-icon";
import { Deploy, deployApi, apiManager } from "@pskishere/piral-compass-api";
import { stopPropagation } from "@pskishere/piral-compass-utils";
import { KubeObjectMenu, KubeObjectMenuProps, KubeObjectListLayout } from "@pskishere/piral-compass-kube-layout";
import { DeployDialog, AddDeployDialog } from "../+workloads-deploy";
import { IDeployWorkloadsParams } from "../+workloads"
import { deployStore } from "./deploy.store";
import { ConfigDeployDialog } from "./config-deploy-dialog";
import { Link } from "react-router-dom";

import {PageComponentProps} from "compass-shell"

enum sortBy {
  templateName = "templateName",
  appName = "appName",
  ownerNamespace = "ownerNamespace",
  resourceType = "resourceType",
  generateTimestamp = "generateTimestamp",
  age = "age",
}

interface Props extends RouteComponentProps<IDeployWorkloadsParams> {
}


export function deployNameRender(deploy: Deploy) {
  const name = deploy.getName();
  return (
    <Link onClick={(event) => { stopPropagation(event); ConfigDeployDialog.open(deploy) }} to={null}>
      <Tooltip title={name} placement="top-start">
        <span>{name}</span>
      </Tooltip>
    </Link>
  );
}

@observer
export class Deploys extends React.Component<PageComponentProps, any> {
  render() {
    return (
      <>
        <KubeObjectListLayout
          isClusterScoped
          className="Deploy" store={deployStore}
          sortingCallbacks={{
            [sortBy.templateName]: (deploy: Deploy) => deploy.getName(),
            [sortBy.appName]: (deploy: Deploy) => deploy.getAppName(),
            [sortBy.ownerNamespace]: (deploy: Deploy) => deploy.getOwnerNamespace(),
            [sortBy.resourceType]: (deploy: Deploy) => deploy.getResourceType(),
            [sortBy.generateTimestamp]: (deploy: Deploy) => deploy.getGenerateTimestamp(),
            [sortBy.age]: (deploy: Deploy) => deploy.getAge(false),
          }
          }
          searchFilters={
            [
              (deploy: Deploy) => deploy.getSearchFields(),
            ]}
          renderHeaderTitle={`Deploys`}
          renderTableHeader={
            [
              { title: `AppName`, className: "appName", sortBy: sortBy.appName },
              { title: `TemplateName`, className: "template", sortBy: sortBy.templateName },
              { title: `OwnerNamespace`, className: "OwnerNamespace", sortBy: sortBy.ownerNamespace },
              { title: `ResourceType`, className: "resourceType", sortBy: sortBy.resourceType },
              {
                title: `Created`,
                className: "Created",
                sortBy: sortBy.generateTimestamp
              },
              { title: `Age`, className: "age", sortBy: sortBy.age },
            ]}
          renderTableContents={(deploy: Deploy) => [
            // deploy.getAppName(),
            deployNameRender(deploy),
            deploy.getName(),
            deploy.getOwnerNamespace(),
            deploy.getResourceType(),
            deploy.getCreated(),
            deploy.getAge(),
          ]}
          renderItemMenu={(item: Deploy) => {
            return <DeployMenu object={item} />
          }}
          addRemoveButtons={{
            addTooltip: `AddDeployDialog`,
            onAdd: () => AddDeployDialog.open()
          }}
        />
        <DeployDialog />
        <AddDeployDialog />
        <ConfigDeployDialog />
      </>
    )
  }
}

export function DeployMenu(props: KubeObjectMenuProps<Deploy>) {
  const { object, toolbar } = props;
  return (
    <>
      <KubeObjectMenu {...props} >
        <MenuItem onClick={() => {
          DeployDialog.open(object.getAppName(), object.getName())
        }}>
          <Icon material="play_circle_filled" title={`Deploy`} interactive={toolbar} />
          <span className="title">`Deploy`</span>
        </MenuItem>
        <MenuItem onClick={() => {
          ConfigDeployDialog.open(object)
        }}>
          <Icon material="sync_alt" title={`Config`} interactive={toolbar} />
          <span className="title">`Config`</span>
        </MenuItem>
      </KubeObjectMenu>
    </>
  )
}

apiManager.registerViews(deployApi, {
  Menu: DeployMenu,
})
