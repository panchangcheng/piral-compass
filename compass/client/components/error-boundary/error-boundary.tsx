import "./error-boundary.scss"

import React, { ErrorInfo } from "react";
import { reaction } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import { Button } from "../button";
import { configStore } from "../../config.store";
import { navigation } from "../../navigation";

interface Props {
}

interface State {
  error?: Error;
  errorInfo?: ErrorInfo;
}

@observer
export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {};

  @disposeOnUnmount
  resetOnNavigate = reaction(
    () => navigation.getPath(),
    () => this.setState({ error: null, errorInfo: null })
  )

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });
  }

  back = () => {
    navigation.goBack();
  }

  render() {
    const { error, errorInfo } = this.state;
    if (error) {
      const slackLink = <a href="https://github.com/yametech" target="_blank">Yametech GitHub</a>
      const githubLink = <a href="https://github.com/yametech/issues" target="_blank">Yametech GitHub</a>
      const pageUrl = location.href;
      return (
        <div className="ErrorBoundary flex column gaps">
          <h5>
            `App crash at <span className="contrast">{pageUrl}</span>`
            {configStore.buildVersion && <p>`Build version`: {configStore.buildVersion}</p>}
          </h5>
          <p>
            `
              To help us improve the product please report bugs to {slackLink} community or {githubLink} issues tracker.
            `
          </p>
          <div className="flex gaps">
            <code>
              <p className="contrast">`Component stack`:</p>
              {errorInfo.componentStack}
            </code>
            <code className="box grow">
              <p className="contrast">`Error stack`:</p> <br />
              {error.stack}
            </code>
          </div>
          <Button
            className="box self-flex-start"
            primary label={`Back`}
            onClick={this.back}
          />
        </div>
      )
    }
    return this.props.children;
  }
}