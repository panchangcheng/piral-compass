import React from "react";
import {computed} from "mobx";
import {observer} from "mobx-react";
import {cssNames} from "../../utils";
import {KubeObject} from "../../api/kube-object";
import {getSelectedDetails, showDetails} from "../../navigation";
import {ItemListLayout, ItemListLayoutProps} from "../item-object-list";
import {KubeObjectStore} from "../../kube-object.store";
import {KubeObjectDetails} from "../kube-object/index";
import {Notifications} from "../notifications";
import {ConfirmDialog} from "../confirm-dialog";
import {KubeConfigDialog} from "../kubeconfig-dialog";

export interface KubeObjectListLayoutProps extends ItemListLayoutProps {
  store: KubeObjectStore;
}

@observer
export class KubeObjectListLayout extends React.Component<KubeObjectListLayoutProps> {
  @computed get selectedItem() {
    return this.props.store.getByPath(getSelectedDetails());
  }

  onDetails = (item: KubeObject) => {
    if (this.props.onDetails) {
      this.props.onDetails(item);
    } else {
      showDetails(item.selfLink);
    }
  }

  render() {
    const {className, ...layoutProps} = this.props;
    return (
      <>
        <ItemListLayout
          {...layoutProps}
          className={cssNames("KubeObjectListLayout", className)}
          detailsItem={this.selectedItem}
          onDetails={this.onDetails}
        />
        <KubeObjectDetails/>
        <Notifications/>
        <ConfirmDialog/>
        <KubeConfigDialog/>
      </>
    );
  }
}
