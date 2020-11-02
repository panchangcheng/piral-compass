import "./sidebar.scss";

import * as React from "react";
import {computed, observable, reaction} from "mobx";
import {observer} from "mobx-react";
import {matchPath, NavLink} from "react-router-dom";
import {createStorage, cssNames} from "compass-base/client/utils";
import {Icon} from "compass-base/client/components/icon";
import {namespaceStore} from "compass-base/client/components/+namespaces/namespace.store";
import {TabRoute} from "./main-layout";
import {navigation} from "compass-base/client/navigation";
import store from 'store'
import {Menu} from "piral";

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

  render() {
    const {toggle, isPinned, className} = this.props;
    const userConfig = store.get('u_config')
    // const isClusterAdmin = userConfig ? userConfig.isClusterAdmin : false
    // const query = namespaceStore.getContextParams();
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
            <Menu type={"general"}/>
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

const navItemStorage = createStorage<[string, boolean][]>("sidebar_menu_item", []);
const navItemState = observable.map<string, boolean>(navItemStorage.get());
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
