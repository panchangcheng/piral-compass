import React from "react";
import { observer } from "mobx-react";
import { Dialog, DialogProps } from "compass-base/client/components/dialog";
import { observable } from "mobx";
import { Input } from "compass-base/client/components/input"
import { Wizard, WizardStep } from "compass-base/client/components/wizard";
import { SubTitle } from "compass-base/client/components/layout/sub-title";
import { NamespaceSelect } from "compass-base/client/components/+namespaces/namespace-select";
import { apiBase } from "compass-base/client/api";
import { Notifications } from "compass-base/client/components/notifications";
import { NamespaceAllowStorageClassSelect } from "compass-base/client/components/+namespaces/namespace-allow-storageclass-select";

interface Props extends Partial<DialogProps> {
}

@observer
export class DeployDialog extends React.Component<Props> {

  @observable static isOpen = false;
  @observable static appName = "";
  @observable static templateName = "";
  @observable namespace = "";
  @observable replicas = "1";
  @observable storageClass = "";

  static open(appName: string, templateName: string) {
    DeployDialog.isOpen = true;
    DeployDialog.appName = appName;
    DeployDialog.templateName = templateName;
  }

  static close() {
    DeployDialog.isOpen = false;
  }

  get appName() {
    return DeployDialog.appName;
  }

  get templateName() {
    return DeployDialog.templateName;
  }

  close = () => {
    DeployDialog.close();
  }

  reset = () => {
    DeployDialog.appName = "";
    DeployDialog.templateName = "";
    this.namespace = "";
  }

  updateDeploy = async () => {
    const data = {
      appName: this.appName,
      templateName: this.templateName,
      storageClass: this.storageClass,
      namespace: this.namespace,
      replicas: this.replicas,
    }
    try {
      await apiBase.post("/deploy", { data }).then((data) => {
        this.reset();
        this.close();
      })
      Notifications.ok(
        <>Deploy {data.appName} to namespace {data.namespace} succeeded</>
      );
    } catch (err) {
      Notifications.error(err);
    }
  }

  render() {
    const { ...dialogProps } = this.props;
    const header = <h5>`Deploy`</h5>;
    return (
      <Dialog
        {...dialogProps}
        className="DeployDialog"
        isOpen={DeployDialog.isOpen}
        close={this.close}
      >
        <Wizard header={header} done={this.close}>
          <WizardStep contentClass="flow column" nextLabel={`Create`}
            next={this.updateDeploy}>
            <div className="namespace">
              <SubTitle title={`Namespace`} />
              <NamespaceSelect
                value={this.namespace}
                placeholder={`Namespace`}
                themeName="light"
                className="box grow"
                onChange={(v) => this.namespace = v.value}
              />

              <SubTitle title={`StorageClass`} />
              <NamespaceAllowStorageClassSelect
                themeName="light"
                className="box grow"
                placeholder={`StorageClass`}
                namespaceName={this.namespace}
                value={this.storageClass}
                onChange={({ value }) => this.storageClass = value}
              />

              <SubTitle title={`Replicas`} />
              <Input
                autoFocus
                placeholder={`Replicas`}
                value={this.replicas}
                onChange={v => this.replicas = v}
              />
            </div>
          </WizardStep>
        </Wizard>
      </Dialog>
    )
  }
}