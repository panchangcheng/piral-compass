import "./add-namespace-dialog.scss";

import React from "react";
import { observable } from "mobx";
import { observer } from "mobx-react";
import { Dialog, DialogProps } from "@pskishere/piral-compass-dialog";
import { Wizard, WizardStep } from "@pskishere/piral-compass-wizard";
import { namespaceStore } from "./namespace.store";
import { Namespace } from "@pskishere/piral-compass-api";
import { Input, systemName } from "@pskishere/piral-compass-input";
import { Notifications } from "@pskishere/piral-compass-notifications";

interface Props extends DialogProps {
  onSuccess?(ns: Namespace): void;
  onError?(error: any): void;
}

@observer
export class AddNamespaceDialog extends React.Component<Props> {
  @observable static isOpen = false;
  @observable namespace = "";

  static open() {
    AddNamespaceDialog.isOpen = true;
  }

  static close() {
    AddNamespaceDialog.isOpen = false;
  }

  close = () => {
    AddNamespaceDialog.close();
  }

  addNamespace = async () => {
    const { namespace } = this;
    const { onSuccess, onError } = this.props;
    try {
      await namespaceStore.create({ name: namespace }).then(onSuccess);
      Notifications.ok(
        <>Namespace {namespace} save succeeded</>
      );
      this.close();
    } catch (err) {
      Notifications.error(err);
      onError && onError(err);
    }
  }

  render() {
    const { ...dialogProps } = this.props;
    const { namespace } = this;
    const header = <h5>`Create Namespace`</h5>;
    return (
      <Dialog
        {...dialogProps}
        className="AddNamespaceDialog"
        isOpen={AddNamespaceDialog.isOpen}
        close={this.close}
      >
        <Wizard header={header} done={this.close}>
          <WizardStep
            contentClass="flex gaps column"
            nextLabel={`Create`}
            next={this.addNamespace}
          >
            <Input
              required autoFocus
              iconLeft="layers"
              placeholder={`Namespace`}
              validators={systemName}
              value={namespace} onChange={v => this.namespace = v.toLowerCase()}
            />
          </WizardStep>
        </Wizard>
      </Dialog>
    )
  }
}
