import "./config-deploy-dialog.scss"

import React from "react";
import {observer} from "mobx-react";
import {Dialog, DialogProps} from "compass-base/client/components/dialog";
import {observable} from "mobx";
import {Wizard, WizardStep} from "compass-base/client/components/wizard";
// import {Container, container, MultiContainerDetails} from "../+deploy-container";
import {Collapse} from "compass-base/client/components/collapse";
// import {deployService, DeployServiceDetails, Service} from "../+deploy-service";
// import {MultiVolumeClaimDetails, VolumeClaimTemplate} from "../+deploy-volumeclaim";
// import {app, App} from "../+deploy-app";
// import {AppDetails} from "../+deploy-app";
import {deployStore} from "./deploy.store";
import {Notifications} from "compass-base/client/components/notifications";
import {Deploy} from "compass-base/client/api/endpoints";

interface Props extends DialogProps {

}

@observer
export class ConfigDeployDialog extends React.Component<Props> {

  @observable static isOpen = false;
  @observable static Data: Deploy = null;
  // @observable app: App = app;
  // @observable service: Service = deployService;
  // @observable containers: Container[] = [container];
  // @observable volumeClaims: VolumeClaimTemplate[] = [];

  static open(object: Deploy) {
    ConfigDeployDialog.isOpen = true;
    ConfigDeployDialog.Data = object;
  }

  get deploy() {
    return ConfigDeployDialog.Data
  }

  static close() {
    ConfigDeployDialog.isOpen = false;
  }

  close = async () => {
    ConfigDeployDialog.close();
    await this.reset();
  }

  reset = async () => {
    // this.app = app;
    // this.service = deployService;
    // this.containers = [container];
    // this.volumeClaims = [];
  }

  onOpen = async () => {
    // this.app = {
    //   name: this.deploy.spec.appName,
    //   type: this.deploy.spec.resourceType
    // };
    // this.containers = JSON.parse(this.deploy.spec.metadata);
    // this.service = JSON.parse(this.deploy.spec.service);
    // this.volumeClaims = JSON.parse(this.deploy.spec.volumeClaims);
  }

  updateDeploy = async () => {

    // const {app, containers, service, volumeClaims} = this;

    try {
      // await deployStore.update(
      //   this.deploy,
      //   {
      //     spec: {
      //       appName: app.name,
      //       resourceType: app.type,
      //       metadata: JSON.stringify(containers),
      //       service: JSON.stringify(service),
      //       volumeClaims: JSON.stringify(volumeClaims),
      //     },
      //   });
      await this.close();
      Notifications.ok(
        <></>
        // <>Deploy {app.name} save succeeded</>
      );
    } catch (err) {
      Notifications.error(err);
    }
  }

  render() {
    const header = <h5>`Config Deploy Workload`</h5>;

    return (
      <Dialog
        isOpen={ConfigDeployDialog.isOpen}
        className="ConfigDeployDialog"
        onOpen={this.onOpen}
        close={this.close}
        pinned
      >
        <Wizard className={"ConfigDeployWizard"} header={header} done={this.close}>
          <WizardStep className={"ConfigDeployWizardStep"} contentClass="flex gaps column" next={this.updateDeploy}>
            <div>
              {/*<AppDetails value={this.app} onChange={value => this.app = value}/>*/}
              {/*<br/>*/}
              {/*<Collapse panelName={`Containers`} key={"containers"}>*/}
              {/*  <MultiContainerDetails value={this.containers}*/}
              {/*                         onChange={value => this.containers = value}/>*/}
              {/*</Collapse>*/}
              {/*<br/>*/}
              {/*<Collapse panelName={`Service`} key={"services"}>*/}
              {/*  <DeployServiceDetails value={this.service}*/}
              {/*                        onChange={value => this.service = value}/>*/}
              {/*</Collapse>*/}
              {/*<br/>*/}
              {/*<Collapse panelName={`Volume`} key={"volume"}>*/}
              {/*  <MultiVolumeClaimDetails value={this.volumeClaims}*/}
              {/*                           onChange={value => this.volumeClaims = value}/>*/}
              {/*</Collapse>*/}
            </div>
          </WizardStep>
        </Wizard>
      </Dialog>
    )
  }
}