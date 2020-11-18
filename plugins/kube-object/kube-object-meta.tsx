import React from "react";
import { IKubeMetaField, KubeObject } from "../../api/kube-object";
import { DrawerItem, DrawerItemLabels } from "../drawer";

export interface Props {
  object: KubeObject;
  hideFields?: IKubeMetaField[];
}

export class KubeObjectMeta extends React.Component<Props> {
  static defaultHiddenFields: IKubeMetaField[] = [
    "uid", "resourceVersion", "selfLink"
  ];

  isHidden(field: IKubeMetaField): boolean {
    const { hideFields = KubeObjectMeta.defaultHiddenFields } = this.props;
    return hideFields.includes(field);
  }

  render() {
    const {
      getName, getNs, getLabels, getResourceVersion, selfLink,
      getAnnotations, getFinalizers, getId, getAge,
      metadata: { creationTimestamp },
    } = this.props.object;
    return (
      <>
        <DrawerItem name={`Created`} hidden={this.isHidden("creationTimestamp")}>
          {getAge(true, false)} `ago` ({creationTimestamp})
        </DrawerItem>
        <DrawerItem name={`Name`} hidden={this.isHidden("name")}>
          {getName()}
        </DrawerItem>
        <DrawerItem name={`Namespace`} hidden={this.isHidden("namespace") || !getNs()}>
          {getNs()}
        </DrawerItem>
        <DrawerItem name={`UID`} hidden={this.isHidden("uid")}>
          {getId()}
        </DrawerItem>
        <DrawerItem name={`Link`} hidden={this.isHidden("selfLink")}>
          {selfLink}
        </DrawerItem>
        <DrawerItem name={`Resource Version`} hidden={this.isHidden("resourceVersion")}>
          {getResourceVersion()}
        </DrawerItem>
        <DrawerItemLabels
          name={`Labels`}
          labels={getLabels()}
          hidden={this.isHidden("labels")}
        />
        <DrawerItemLabels
          name={`Annotations`}
          labels={getAnnotations()}
          hidden={this.isHidden("annotations")}
        />
        <DrawerItemLabels
          name={`Finalizers`}
          labels={getFinalizers()}
          hidden={this.isHidden("finalizers")}
        />
      </>
    )
  }
}
