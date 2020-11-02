import "./sidebar.scss";

import * as React from "react";
import {computed, observable, reaction} from "mobx";
import {observer} from "mobx-react";
import {matchPath, NavLink} from "react-router-dom";
import {createStorage, cssNames} from "../../utils";
import {Icon} from "../icon";
import {namespacesURL} from "../+namespaces";
import {nodesURL} from "../+nodes";
import {clusterURL} from "../+cluster";
import {eventRoute, eventsURL} from "../+events";
import {namespaceStore} from "../+namespaces/namespace.store";
import {TabRoute} from "./main-layout";
import {crdStore} from "../+custom-resources";
import {CrdList, crdResourcesRoute, crdRoute, crdURL} from "../+custom-resources";
import {CustomResources} from "../+custom-resources/custom-resources";
import {navigation} from "../../navigation";
import store from 'store'

const SidebarContext = React.createContext<SidebarContextValue>({pinned: false});
type SidebarContextValue = {
  pinned: boolean;
};

interface Props {
  className?: string;
  isPinned: boolean;

  toggle(): void;
}

@observer
export class Sidebar extends React.Component<Props> {
  renderCustomResources() {
    return Object.entries(crdStore.groups).map(([group, crds]) => {
      const submenus = crds.map(crd => {
        return {
          title: crd.getResourceKind(),
          component: CrdList,
          url: crd.getResourceUrl(),
          path: crdResourcesRoute.path,
        }
      })
      return (
        <SidebarNavItem
          key={group}
          id={group}
          className="sub-menu-parent"
          url={crdURL({query: {groups: group}})}
          subMenus={submenus}
          text={group}
        />
      )
    })
  }

  render() {
    const {toggle, isPinned, className} = this.props;
    const userConfig = store.get('u_config')
    const isClusterAdmin = userConfig ? userConfig.isClusterAdmin : false
    const query = namespaceStore.getContextParams();
    return (
      <SidebarContext.Provider value={{pinned: isPinned}}>
        <div className={cssNames("Sidebar flex column", className, {pinned: isPinned})}>
          <div className="header flex align-center">
            <NavLink exact to="/workloads" className="box grow">
              <Icon svg="compass" className="logo-icon"/>
              <div className="logo-text">Compass</div>
            </NavLink>
            <Icon
              className="pin-icon"
              material={isPinned ? "keyboard_arrow_left" : "keyboard_arrow_right"}
              onClick={toggle}
              tooltip={isPinned ? `Compact view` : `Extended view`}
              focusable={false}
            />
          </div>
          <div className="sidebar-nav flex column box grow-fixed">
            <SidebarNavItem
              isHidden={!isClusterAdmin}
              id="cluster"
              url={clusterURL()}
              text={`Cluster`}
              icon={<Icon svg="kube"/>}
            />
            <SidebarNavItem
              isHidden={!isClusterAdmin}
              id="nodes"
              url={nodesURL()}
              text={`Nodes`}
              icon={<Icon svg="nodes"/>}
            />
            <SidebarNavItem
              id="events"
              url={eventsURL({query})}
              routePath={eventRoute.path}
              icon={<Icon material="access_time"/>}
              text={`Events`}
            />
            <SidebarNavItem
              isHidden={!isClusterAdmin}
              id="namespaces"
              url={namespacesURL()}
              icon={<Icon material="layers"/>}
              text={`Namespaces`}
            />
            <SidebarNavItem
              isHidden={!isClusterAdmin}
              id="custom-resources"
              url={crdURL()}
              subMenus={CustomResources.tabRoutes}
              routePath={crdRoute.path}
              icon={<Icon material="extension"/>}
              text={`Custom Resources`}
            >
              {this.renderCustomResources()}
            </SidebarNavItem>
          </div>
        </div>
      </SidebarContext.Provider>
    )
  }
}

interface SidebarNavItemProps {
  id: string;
  url: string;
  text: React.ReactNode | string;
  className?: string;
  icon?: React.ReactNode;
  isHidden?: boolean;
  routePath?: string | string[];
  subMenus?: TabRoute[];
}

export const navItemStorage = createStorage<[string, boolean][]>("sidebar_menu_item", []);
export const navItemState = observable.map<string, boolean>(navItemStorage.get());
reaction(() => [...navItemState], value => navItemStorage.set(value));

@observer
export class SidebarNavItem extends React.Component<SidebarNavItemProps> {
  static contextType = SidebarContext;
  public context: SidebarContextValue;

  @computed get isExpanded() {
    return navItemState.get(this.props.id);
  }

  toggleSubMenu = () => {
    navItemState.set(this.props.id, !this.isExpanded);
  }

  isActive = () => {
    const {routePath, url} = this.props;
    const {pathname} = navigation.location;
    return !!matchPath(pathname, {
      path: routePath || url
    });
  }

  render() {
    const {isHidden, subMenus = [], icon, text, url, children, className} = this.props;
    if (isHidden) {
      return null;
    }
    // const extendedView = (subMenus.length > 0 || children) && this.context.pinned;
    const extendedView = subMenus.length > 0;
    if (extendedView) {
      const isActive = this.isActive();
      return (
        <div className={cssNames("SidebarNavItem", className)}>
          <div className={cssNames("nav-item", {active: isActive})} onClick={this.toggleSubMenu}>
            {icon}
            <span className="link-text">{text}</span>
            <Icon
              className="expand-icon"
              material={this.isExpanded ? "keyboard_arrow_up" : "keyboard_arrow_down"}
            />
          </div>
          <ul className={cssNames("sub-menu", {active: isActive})}>
            {subMenus.map(({title, url}) => (
              <NavLink key={url} to={url} className={cssNames({visible: this.isExpanded})}>
                {title}
              </NavLink>
            ))}
            {React.Children.toArray(children).map((child: React.ReactElement<any>) => {
              return React.cloneElement(child, {
                className: cssNames(child.props.className, {visible: this.isExpanded})
              });
            })}
          </ul>
        </div>
      )
    }
    return (
      <NavLink className={cssNames("SidebarNavItem", className)} to={url} isActive={this.isActive}>
        {icon}
        <span className="link-text">{text}</span>
      </NavLink>
    )
  }
}
