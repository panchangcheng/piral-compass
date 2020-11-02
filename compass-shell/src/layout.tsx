import * as React from 'react';
import {ComponentsState, ErrorComponentsState, SwitchErrorInfo} from 'piral';
import {Link} from 'react-router-dom';
import "compass-base/client/components/layout/main-layout.scss";
import {Layout} from "./main-layout";

export const errors: Partial<ErrorComponentsState> = {
  not_found: () => (
    <div>
      <p className="error">Could not find the requested page. Are you sure it exists?</p>
      <p>
        Go back <Link to="/">to the dashboard</Link>.
      </p>
    </div>
  ),
};


export const layout: Partial<ComponentsState> = {
  ErrorInfo: props => (
    <div>
      <h1>Error</h1>
      <SwitchErrorInfo {...props} />
    </div>
  ),
  Layout: Layout,
  MenuContainer: ({children}) => {
    console.log("menu", children);
    return (
      <>
        {children}
      </>
    );
  },
  NotificationsHost: ({children}) => <div className="notifications">{children}</div>,
  NotificationsToast: ({options, onClose, children}) => (
    <div className={`notification-toast ${options.type}`}>
      <div className="notification-toast-details">
        {options.title && <div className="notification-toast-title">{options.title}</div>}
        <div className="notification-toast-description">{children}</div>
      </div>
      <div className="notification-toast-close" onClick={onClose}/>
    </div>
  ),
};

