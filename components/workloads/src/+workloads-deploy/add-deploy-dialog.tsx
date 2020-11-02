import "./add-deploy-dialog.scss"

import React from "react";
import {observer} from "mobx-react";
import {Dialog, DialogProps} from "compass-base/client/components/dialog";
import {observable} from "mobx";
import {Wizard, WizardStep} from "compass-base/client/components/wizard";
// import {Container, container, MultiContainerDetails} from "../+deploy-container";
// import {deployService, DeployServiceDetails, Service} from "../+deploy-service";
// import {MultiVolumeClaimDetails, VolumeClaimTemplate} from "../+deploy-volumeclaim";
// import {app, App} from "../+deploy-app";
// import {AppDetails} from "../+deploy-app";
import {deployStore} from "./deploy.store";
import {Notifications} from "compass-base/client/components/notifications";
import {configStore} from "compass-base/client/config.store";
import {Collapse} from "compass-base/client/components/collapse";

interface Props extends DialogProps {
}

@observer
export class AddDeployDialog extends React.Component<Props> {

  @observable static isOpen = false;
  // @observable app: App = app;
  // @observable service: Service = deployService;
  // @observable containers: Container[] = [container];
  // @observable volumeClaims: VolumeClaimTemplate[] = [];

  static open() {
    AddDeployDialog.isOpen = true;
  }

  static close() {
    AddDeployDialog.isOpen = false;
  }

  close = async () => {
    AddDeployDialog.close();
    await this.reset();
  }

  reset = async () => {
    // this.app = app;
    // this.service = deployService;
    // this.containers = [container];
    // this.volumeClaims = [];
  }

  addDeployDialog = async () => {

    // const {app, containers, service, volumeClaims} = this;
    // const name = app.name + '-' + Math.floor(Date.now() / 1000)

    try {
      // await deployStore.create(
      //   {
      //     name: name,
      //     namespace: '',
      //     labels: new Map<string, string>().set("namespace", configStore.getDefaultNamespace())
      //   },
      //   {
      //     spec: {
      //       appName: app.name,
      //       resourceType: app.type,
      //       metadata: JSON.stringify(containers),
      //       service: JSON.stringify(service),
      //       volumeClaims: JSON.stringify(volumeClaims),
      //     },
      //   });

      Notifications.ok(
        <>Deploy {name} succeeded</>
      );
      await this.close();
    } catch (err) {
      Notifications.error(err);
    }
  }

  render() {
    const header = <h5>`Apply Deploy Workload`</h5>;

    return (
      <Dialog
        className="AddDeployDialog"
        isOpen={AddDeployDialog.isOpen}
        close={this.close}
        pinned
      >
        <Wizard className={"AddDeployWizard"} header={header} done={this.close}>
          <WizardStep className={"AddDeployWizardStep"} contentClass="flex gaps column" next={this.addDeployDialog}>
            <div className="init-form">
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