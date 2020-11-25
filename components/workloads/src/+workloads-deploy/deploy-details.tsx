import React from "react";
import {observer, disposeOnUnmount} from "mobx-react";
import {autorun} from "mobx";
import {Deploy, deployApi, apiManager} from "@pskishere/piral-compass-api"
import {KubeObjectMeta, KubeObjectDetailsProps} from "@pskishere/piral-compass-kube-layout";

interface Props extends KubeObjectDetailsProps<Deploy> {
}

@observer
export class DeployDetails extends React.Component<Props> {

  async componentDidMount() {
    disposeOnUnmount(this, [
      autorun(() => {
        const {object: deploy} = this.props;
      }),
    ])
  }

  render() {
    const {object: deploy} = this.props;
    if (!deploy) return null;
    return (
      <div className="DeployDetails">
        <KubeObjectMeta object={deploy}/>
      </div>
    )
  }
}

apiManager.registerViews(deployApi, {
  Details: DeployDetails
})