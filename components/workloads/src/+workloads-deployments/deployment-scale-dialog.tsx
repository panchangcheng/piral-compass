import "./deployment-scale-dialog.scss";

import React, { Component } from "react";
import { computed, observable } from "mobx";
import { observer } from "mobx-react";
import { Dialog, DialogProps } from "@pskishere/piral-compass-dialog";
import { Wizard, WizardStep } from "@pskishere/piral-compass-wizard";
import { Deployment, deploymentApi } from "@pskishere/piral-compass-api";
import { Icon } from "@pskishere/piral-compass-icon";
import { Slider } from "@pskishere/piral-compass-slider";
import { Notifications } from "@pskishere/piral-compass-notifications";
import { cssNames } from "@pskishere/piral-compass-utils";

interface Props extends Partial<DialogProps> {
}

@observer
export class DeploymentScaleDialog extends Component<Props> {
  @observable static isOpen = false;
  @observable static data: Deployment = null;

  @observable ready = false;
  @observable currentReplicas = 0;
  @observable desiredReplicas = 0;

  static open(deployment: Deployment) {
    DeploymentScaleDialog.isOpen = true;
    DeploymentScaleDialog.data = deployment;
  }

  static close() {
    DeploymentScaleDialog.isOpen = false;
  }

  get deployment() {
    return DeploymentScaleDialog.data;
  }

  close = () => {
    DeploymentScaleDialog.close();
  }

  @computed get scaleMax() {
    const { currentReplicas } = this;
    const defaultMax = 50;
    return currentReplicas <= defaultMax
      ? defaultMax * 2
      : currentReplicas * 2;
  }

  onOpen = async () => {
    const { deployment } = this;
    this.currentReplicas = await deploymentApi.getReplicas({
      namespace: deployment.getNs(),
      name: deployment.getName(),
    });
    this.desiredReplicas = this.currentReplicas;
    this.ready = true;
  }

  onClose = () => {
    this.ready = false;
  }

  onChange = (evt: React.ChangeEvent, value: number) => {
    this.desiredReplicas = value;
  }

  scale = async () => {
    const { deployment } = this;
    const { currentReplicas, desiredReplicas, close } = this;
    try {
      if (currentReplicas !== desiredReplicas) {
        await deploymentApi.scale({
          name: deployment.getName(),
          namespace: deployment.getNs(),
        }, desiredReplicas);
      }
      close();
    } catch (err) {
      Notifications.error(err);
    }
  }

  renderContents() {
    const { currentReplicas, desiredReplicas, onChange, scaleMax } = this;
    const warning = currentReplicas < 10 && desiredReplicas > 90;
    return (
      <>
        <div className="current-scale">
          `Current replica scale: {currentReplicas}`
        </div>
        <div className="flex gaps align-center">
          <div className="desired-scale">
            `Desired number of replicas`: {desiredReplicas}
          </div>
          <div className="slider-container">
            <Slider value={desiredReplicas} max={scaleMax} onChange={onChange as any}/>
          </div>
        </div>
        {warning &&
        <div className="warning">
          <Icon material="warning"/>
          `High number of replicas may cause cluster performance issues`
        </div>
        }
      </>
    )
  }

  render() {
    const { className, ...dialogProps } = this.props;
    const deploymentName = this.deployment ? this.deployment.getName() : "";
    const header = (
      <h5>
        `Scale Deployment <span>{deploymentName}</span>`
      </h5>
    );
    return (
      <Dialog
        {...dialogProps}
        isOpen={DeploymentScaleDialog.isOpen}
        className={cssNames("DeploymentScaleDialog", className)}
        onOpen={this.onOpen}
        onClose={this.onClose}
        close={this.close}
      >
        <Wizard header={header} done={this.close}>
          <WizardStep
            contentClass="flex gaps column"
            next={this.scale}
            nextLabel={`Scale`}
            disabledNext={!this.ready}
          >
            {this.renderContents()}
          </WizardStep>
        </Wizard>
      </Dialog>
    );
  }
}