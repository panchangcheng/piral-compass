import "./app.scss";

import React from "react";
import store from 'store'
import {render} from "react-dom";
import {Redirect, Route, Router, Switch} from "react-router";
import {observer} from "mobx-react";
import {browserHistory} from "../navigation";
import {Notifications} from "./notifications";
import {NotFound} from "./+404";
import {configStore} from "../config.store";
import {ConfirmDialog} from "./confirm-dialog";
import {clusterRoute, clusterURL} from "./+cluster";
import {KubeConfigDialog} from "./kubeconfig-dialog";
import {Nodes, nodesRoute} from "./+nodes";
import {Namespaces, namespacesRoute} from "./+namespaces";
import {Cluster} from "./+cluster/cluster";
import {Events} from "./+events";
import {Login} from "./+login";

import {eventRoute} from "./+events";
import {ErrorBoundary} from "./error-boundary";
import {KubeObjectDetails} from "./kube-object";
import {CustomResources} from "./+custom-resources/custom-resources";
import {crdRoute} from "./+custom-resources";

@observer
class App extends React.Component {
  static rootElem = document.getElementById('app');

  static async init() {

    // render app
    render(<App/>, App.rootElem);
  };

  render() {
    let homeUrl = ''
    const userConfig = store.get('u_config')
    if (userConfig) {
      configStore.setConfig(userConfig)
      let admin = userConfig.isClusterAdmin
      // homeUrl = admin == 'true' ? clusterURL() : workloadsURL();
      homeUrl = admin == 'true' ? clusterURL() : 'login';
    } else {
      homeUrl = '/login'
    }

    return (
      <div>

        <Router history={browserHistory}>
          <ErrorBoundary>
            <Switch>
              <Route component={Cluster} {...clusterRoute} />
              <Route component={Nodes} {...nodesRoute} />
              <Route component={Namespaces} {...namespacesRoute} />
              <Route component={Events} {...eventRoute} />
              <Route component={CustomResources} {...crdRoute} />
              <Redirect exact from="/" to={homeUrl}/>
              <Route component={Login} path="/login"/>
              <Route path="*" component={NotFound}/>
            </Switch>
            <KubeObjectDetails/>
            <Notifications/>
            <ConfirmDialog/>
            <KubeConfigDialog/>
          </ErrorBoundary>
        </Router>
      </div>

    )
  }
}

// run app
App.init();
