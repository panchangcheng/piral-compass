import "./injector-details.scss";

import React from "react";
import { disposeOnUnmount, observer } from "mobx-react";
import { reaction } from "mobx";
import { DrawerItem } from "compass-base/client/components/drawer";
import { injectorStore } from "./injectors.store";
import { KubeObjectDetailsProps } from "compass-base/client/components/kube-object";
import { injectorApi, Injector } from "compass-base/client/api/endpoints";
import { apiManager } from "compass-base/client/api/api-manager";
// import { stoneStore} from "../+workloads-stones"

interface Props extends KubeObjectDetailsProps<Injector> {
}

@observer
export class InjectorDetails extends React.Component<Props> {
  @disposeOnUnmount
  clean = reaction(() => this.props.object, () => {
    injectorStore.reset();
  });

  componentDidMount() {
  }

  componentWillUnmount() {
    injectorStore.reset();
  }

  render() {
    const { object: injector } = this.props;
    if (!injector) return null
    const ownerRef = injector.getOwnerRefs()[0];
    return (
      <div className="InjectorDetails">
        <DrawerItem name={`Owner Type`}>
          {
            <>{ownerRef.kind}</>
          }
        </DrawerItem>

        <DrawerItem name={`Owner`}>
          {
            <>{ownerRef.namespace} / {ownerRef.name}</>

          }
        </DrawerItem>
      </div>
    )
  }
}

apiManager.registerViews(injectorApi, {
  Details: InjectorDetails
})