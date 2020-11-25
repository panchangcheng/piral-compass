import "./config-stone-dialog.scss";

import { observable } from "mobx";
import React from "react";
import { observer } from "mobx-react";
import { Dialog, DialogProps } from "@pskishere/piral-compass-dialog";
import { Stone } from "@pskishere/piral-compass-api";
import { Wizard, WizardStep } from "@pskishere/piral-compass-wizard";
import { SubTitle } from "@pskishere/piral-compass-sub-title";
import { Notifications } from "@pskishere/piral-compass-notifications";
import { Select } from "@pskishere/piral-compass-select";
import { Input, isNumber } from "@pskishere/piral-compass-input";
import { stoneStore } from "./stones.store";

interface Props extends Partial<DialogProps> {
}

interface Coordinate {
  group: string
  replicas: number
  zoneset: {
    rack: string
    host: string
  }[]
}

@observer
export class ConfigStoneDialog extends React.Component<Props> {

  @observable static isOpen = false;
  @observable static data: Stone = null;
  @observable strategy: string = "";
  @observable containers: any[] = [];
  @observable coordinates: Coordinate[] = [];

  static open(object: Stone) {
    ConfigStoneDialog.isOpen = true;
    ConfigStoneDialog.data = object;
  }

  static close() {
    ConfigStoneDialog.isOpen = false;
  }

  close = () => {
    ConfigStoneDialog.close();
  }

  updateStone = async () => {
    try {
      this.stone.spec.strategy = this.strategy;
      this.stone.spec.coordinates = this.coordinates;
      this.stone.spec.template.spec.containers = this.containers;
      await stoneStore.update(this.stone, { ...this.stone })
      Notifications.ok(
        <>Stone {this.stone.getName()} save succeeded</>
      );
      this.close();
    } catch (err) {
      Notifications.error(err);
    }
  }

  get options() {
    return [
      "Alpha",
      "Beta",
      "Omega",
      "Release"
    ]
  }

  get stone(): Stone {
    return ConfigStoneDialog.data
  }

  onOpen = async () => {
    try {
      this.strategy = this.stone.spec.strategy;
    } catch (e) {
      this.strategy = "";
    }

    try {
      this.coordinates = this.stone.spec.coordinates
    } catch (e) {
      this.coordinates = [];
    }

    try {
      this.containers = this.stone.spec.template.spec.containers
    } catch (e) {
      this.containers = [];
    }
  }

  render() {
    const { ...dialogProps } = this.props;
    const header = <h5>`Update Stone`</h5>;
    return (
      <Dialog
        {...dialogProps}
        className="ConfigStoneDialog"
        isOpen={ConfigStoneDialog.isOpen}
        onOpen={this.onOpen}
        close={this.close}
      >
        <Wizard header={header} done={this.close}>
          <WizardStep contentClass="flow column" nextLabel={`Config Stone`} next={this.updateStone}>
            <SubTitle title={`Strategy`} />
            <Select
              value={this.strategy}
              options={this.options}
              themeName="light"
              className="box grow"
              onChange={value => this.strategy = value.value}
            />
            <br />
            {this?.containers?.map((item, index) => {
              return (
                <>
                  <SubTitle title={`Image` + '-' + index} />
                  <Input
                    required={true}
                    placeholder={`Request Images`}
                    value={this.containers[index].image}
                    onChange={value => this.containers[index].image = value}
                  />
                </>
              )
            })}

            <br />
            {this?.coordinates?.map((item, index) => {
              return (
                <>
                  <SubTitle title={`Group` + '-' + this.coordinates[index].group} />
                  <Input
                    required={true}
                    placeholder={`Request Replicas`}
                    type="number"
                    validators={isNumber}
                    min={0}
                    value={String(this.coordinates[index].replicas)}
                    onChange={value => this.coordinates[index].replicas = Number(value)}
                  />
                </>
              )
            })}
          </WizardStep>
        </Wizard>
      </Dialog>
    )
  }
}