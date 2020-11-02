import "./dock.scss";

import React, { Fragment } from "react";
import { observer } from "mobx-react";
import { autobind, cssNames, prevDefault } from "../../utils";
import { Draggable, DraggableState } from "../draggable";
import { Icon } from "../icon";
import { Tabs } from "../tabs/tabs";
import { MenuItem } from "../menu";
import { MenuActions } from "../menu/menu-actions";
import { dockStore, IDockTab } from "./dock.store";
import { DockTab } from "./dock-tab";
import { TerminalTab } from "./terminal-tab";
import { TerminalWindow } from "./terminal-window";
import { CreateResource } from "./create-resource";
import { EditResource } from "./edit-resource";
import { createTerminalTab, isTerminalTab } from "./terminal.store";
import { createResourceTab, isCreateResourceTab } from "./create-resource.store";
import { isEditResourceTab } from "./edit-resource.store";
import store from 'store';

interface Props {
  className?: string;
}

@observer
export class Dock extends React.Component<Props> {
  onResizeStart = () => {
    const { isOpen, open, setHeight, minHeight } = dockStore;
    if (!isOpen) {
      open();
      setHeight(minHeight);
    }
  }

  onResize = ({ offsetY }: DraggableState) => {
    const { isOpen, close, height, setHeight, minHeight, defaultHeight } = dockStore;
    const newHeight = height + offsetY;
    if (height > newHeight && newHeight < minHeight) {
      setHeight(defaultHeight);
      close();
    }
    else if (isOpen) {
      setHeight(newHeight);
    }
  }

  onKeydown = (evt: React.KeyboardEvent<HTMLElement>) => {
    const { close, closeTab, selectedTab, fullSize, toggleFillSize } = dockStore;
    if (!selectedTab) return;
    const { code, ctrlKey, shiftKey } = evt.nativeEvent;
    if (shiftKey && code === "Escape") {
      close();
    }
    if (ctrlKey && code === "KeyW") {
      if (selectedTab.pinned) close();
      else closeTab(selectedTab.id);
    }
  }

  onChangeTab = (tab: IDockTab) => {
    const { open, selectTab } = dockStore;
    open();
    selectTab(tab.id);
  }

  @autobind()
  renderTab(tab: IDockTab) {
    if (isTerminalTab(tab)) {
      return <TerminalTab value={tab}/>
    }
    if (isCreateResourceTab(tab) || isEditResourceTab(tab)) {
      return <DockTab value={tab} icon="edit"/>
    }
  }

  renderTabContent() {
    const { isOpen, height, selectedTab: tab } = dockStore;
    if (!isOpen || !tab) return;
    return (
      <div className="tab-content" style={{ flexBasis: height }}>
        {isCreateResourceTab(tab) && <CreateResource tab={tab}/>}
        {isEditResourceTab(tab) && <EditResource tab={tab}/>}
        {isTerminalTab(tab) && <TerminalWindow tab={tab}/>}
      </div>
    )
  }

  render() {
    const { className } = this.props;
    const { isOpen, toggle, tabs, toggleFillSize, selectedTab, hasTabs, fullSize } = dockStore;
    let isClusterAdmin = false
    const userConfig = store.get('u_config')
    if(userConfig){
      isClusterAdmin = userConfig.isClusterAdmin
    }
    return (
      <div
        className={cssNames("Dock", className, { isOpen, fullSize })}
        onKeyDown={this.onKeydown}
        tabIndex={-1}
      >
        <Draggable
          className={cssNames("resizer", { disabled: !hasTabs() })}
          horizontal={false}
          onStart={this.onResizeStart}
          onEnter={this.onResize}
        />
        <div className="tabs-container flex align-center" onDoubleClick={prevDefault(toggle)}>
          <Tabs
            autoFocus={isOpen}
            className="dock-tabs"
            value={selectedTab} onChange={this.onChangeTab}
            children={tabs.map(tab => <Fragment key={tab.id}>{this.renderTab(tab)}</Fragment>)}
          />
          <div className="toolbar flex gaps align-center box grow">
            <div className="dock-menu box grow" >
              <div hidden={!isClusterAdmin}>
                <MenuActions usePortal triggerIcon={{ material: "add", tooltip: `New tab` }} closeOnScroll={false}>
                  {/*<MenuItem onClick={() => createTerminalTab()}>*/}
                  {/*  <Icon small svg="terminal" size={15}/>*/}
                  {/*  `Terminal session`*/}
                  {/*</MenuItem>*/}
                  <MenuItem onClick={() => createResourceTab()}>
                    <Icon small material="create"/>
                    `Create resource`
                  </MenuItem>
                </MenuActions>
              </div>
            </div>
            {hasTabs() && (
              <>
                <Icon
                  material={fullSize ? "fullscreen_exit": "fullscreen"}
                  tooltip={fullSize ? `Exit full size mode` : `Fit to window`}
                  onClick={toggleFillSize}
                />
                <Icon
                  material={`keyboard_arrow_${isOpen ? "down" : "up"}`}
                  tooltip={isOpen ? `Minimize` : `Open`}
                  onClick={toggle}
                />
              </>
            )}
          </div>
        </div>
        {this.renderTabContent()}
      </div>
    )
  }
}
