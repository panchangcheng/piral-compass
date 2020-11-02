import "./service-details.scss";

import React from "react";
import {observer} from "mobx-react";
import {SubTitle} from "../layout/sub-title";
import {Select} from "../select";
import {Icon} from "../icon";
import {Input} from "../input";
import {isNumber} from "../input/input.validators";
import {computed, observable} from "mobx";
import {deployPort, deployService, Service} from "./common";
import {ActionMeta} from "react-select/src/types";
import {Paper, Grid} from "@material-ui/core";
import {stopPropagation} from "../../utils";

interface TabPanelProps {
  children?: React.ReactNode;
  index: any;
  value: any;
}

export interface Props<T = any> extends Partial<Props> {
  value?: T;
  showIcons?: boolean;
  themeName?: "dark" | "light" | "outlined";

  onChange?(value: T, meta?: ActionMeta<any>): void;
}

@observer
export class DeployServiceDetails extends React.Component<Props> {

  // @observable value: Service = this.props.value || deployService;
  @observable Index: number = 0;
  @computed get value(): Service {
    return this.props.value || deployService;
  }

  get typeOptions() {
    return [
      "ClusterIP",
      "NodePort",
      "LoadBalancer",
    ]
  }

  get protocolOptions() {
    return [
      "TCP",
      "UDP"
    ]
  }

  add() {
    this.value.ports.push(deployPort)
  }

  remove(index: number) {
    this.value.ports.splice(index, 1);
  }

  rPorts(index: number) {
    return (
      <>
        <br/>
        <Paper elevation={3} style={{padding: 25}}>
          <Grid container spacing={5} alignItems="center" direction="row">
            <Grid item xs={11} zeroMinWidth>
              <Grid>
                <SubTitle title={`Name`}/>
                <Input
                  className="item"
                  required={true}
                  placeholder={`Name`}
                  value={this.value.ports[index].name}
                  onChange={(value) => {
                    this.value.ports[index].name = value;
                  }}
                />
                <SubTitle title={`Protocol`}/>
                <Select
                  options={this.protocolOptions}
                  value={this.value.ports[index].protocol}
                  onChange={v => {
                    this.value.ports[index].protocol = v.value;
                  }}
                />
              </Grid>
              <br/>
              <Grid container spacing={5} alignItems="center" direction="row">
                <Grid item xs zeroMinWidth>
                  <SubTitle title={`Port`}/>
                  <Input
                    required={true}
                    placeholder={`Port`}
                    type="number"
                    validators={isNumber}
                    value={this.value.ports[index].port}
                    onChange={value => this.value.ports[index].port = value}
                  />
                </Grid>
                <Grid item xs zeroMinWidth>
                  <SubTitle title={`TargetPort`}/>
                  <Input
                    required={true}
                    placeholder={`TargetPort`}
                    type="number"
                    validators={isNumber}
                    value={this.value.ports[index].targetPort}
                    onChange={value => this.value.ports[index].targetPort = value}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs zeroMinWidth style={{textAlign: "center"}}>
              <Icon
                small
                tooltip={`Remove Ports`}
                style={{margin: "0.8vw, 0.9vh"}}
                className="remove-icon"
                material="clear"
                onClick={(e) => {
                  this.remove(index);
                  e.stopPropagation()
                }}
              />
            </Grid>
          </Grid>
        </Paper>
      </>
    )
  }

  render() {

    return (
      <>
        <SubTitle title={`Service Type`}/>
        <Select
          options={this.typeOptions}
          value={this.value.type}
          onChange={v => {
            this.value.type = v.value
          }}
        />
        <SubTitle
          title={
            <>
              Ports
              &nbsp;&nbsp;
              <Icon material={"edit"} className={"editIcon"} onClick={event => {
                stopPropagation(event);
                this.add()
              }} small/>
            </>
          }>
        </SubTitle>
        {this.value.ports.map((item: any, index: number) => {
          return this.rPorts(index)
        })}
      </>
    )
  }

}