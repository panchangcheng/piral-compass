import "./pod-logs-dialog.scss";

import * as React from "react";
import { observable } from "mobx";
import { observer } from "mobx-react";
import { Dialog, DialogProps } from "compass-base/client/components/dialog";
import { Wizard, WizardStep } from "compass-base/client/components/wizard";
import { IPodContainer, Pod, podsApi } from "compass-base/client/api/endpoints";
import { Icon } from "compass-base/client/components/icon";
import { Select, SelectOption } from "compass-base/client/components/select";
import { Spinner } from "compass-base/client/components/spinner";
import { cssNames, downloadFile, interval } from "compass-base/client/utils";

interface IPodLogsDialogData {
  pod: Pod;
  container?: IPodContainer;
}

interface Props extends Partial<DialogProps> {
}

@observer
export class PodLogsDialog extends React.Component<Props> {
  @observable static isOpen = false;
  @observable static data: IPodLogsDialogData = null;

  static open(pod: Pod, container?: IPodContainer) {
    PodLogsDialog.isOpen = true;
    PodLogsDialog.data = { pod, container };
  }

  static close() {
    PodLogsDialog.isOpen = false;
  }

  get data() {
    return PodLogsDialog.data;
  }

  private logsArea: HTMLDivElement;
  private refresher = interval(5, () => this.load());
  private containers: IPodContainer[] = []
  private initContainers: IPodContainer[] = []
  private lastLineIsShown = true; // used for proper auto-scroll content after refresh

  @observable logs = ""; // latest downloaded logs for pod
  @observable newLogs = ""; // new logs since dialog is open
  @observable logsReady = false;
  @observable selectedContainer: IPodContainer;
  @observable showTimestamps = true;
  @observable tailLines = 1000;

  lineOptions = [
    { label: `All logs`, value: Number.MAX_SAFE_INTEGER },
    { label: 1000, value: 1000 },
    { label: 10000, value: 10000 },
    { label: 100000, value: 100000 },
  ]

  onOpen = async () => {
    const { pod, container } = this.data;
    this.containers = pod.getContainers();
    this.initContainers = pod.getInitContainers();
    this.selectedContainer = container || this.containers[0];
    await this.load();
    this.refresher.start();
  }

  onClose = () => {
    this.resetLogs();
    this.refresher.stop();
  }

  close = () => {
    PodLogsDialog.close();
  }

  load = async () => {
    if (!this.data) return;
    const { pod } = this.data;
    try {
      // if logs already loaded, check the latest timestamp for getting updates only from this point
      const logsTimestamps = this.getTimestamps(this.newLogs || this.logs);
      let lastLogDate = new Date(0)
      if (logsTimestamps) {
        lastLogDate = new Date(logsTimestamps.slice(-1)[0]);
        lastLogDate.setSeconds(lastLogDate.getSeconds() + 1); // avoid duplicates from last second
      }
      const namespace = pod.getNs();
      const name = pod.getName();
      const logs = await podsApi.getLogs({ namespace, name }, {
        container: this.selectedContainer.name,
        timestamps: true,
        tailLines: this.tailLines ? this.tailLines : undefined,
        sinceTime: lastLogDate.toISOString(),
      });
      if (!this.logs) {
        this.logs = logs;
      }
      else if (logs) {
        this.newLogs = `${this.newLogs}\n${logs}`.trim();
      }
    } catch (error) {
      this.logs = [
        `Failed to load logs: ${error.message}`,
        `Reason: ${error.reason} (${error.code})`,
      ].join("\n")
    }
    this.logsReady = true;
  }

  reload = async () => {
    this.resetLogs();
    this.refresher.stop();
    await this.load();
    this.refresher.start();
  }

  componentDidUpdate() {
    // scroll logs only when it's already in the end,
    // otherwise it can interrupt reading by jumping after loading new logs update
    if (this.logsArea && this.lastLineIsShown) {
      this.logsArea.scrollTop = this.logsArea.scrollHeight;
    }
  }

  onScroll = (evt: React.UIEvent<HTMLDivElement>) => {
    const logsArea = evt.currentTarget;
    const { scrollHeight, clientHeight, scrollTop } = logsArea;
    this.lastLineIsShown = clientHeight + scrollTop === scrollHeight;
  };

  getLogs() {
    const { logs, newLogs, showTimestamps } = this;
    return {
      logs: showTimestamps ? logs : this.removeTimestamps(logs),
      newLogs: showTimestamps ? newLogs : this.removeTimestamps(newLogs),
    }
  }

  getTimestamps(logs: string) {
    return logs.match(/^\d+\S+/gm);
  }

  removeTimestamps(logs: string) {
    return logs.replace(/^\d+.*?\s/gm, "");
  }

  resetLogs() {
    this.logs = "";
    this.newLogs = "";
    this.lastLineIsShown = true;
    this.logsReady = false;
  }

  onContainerChange = (option: SelectOption) => {
    this.selectedContainer = this.containers
      .concat(this.initContainers)
      .find(container => container.name === option.value);
    this.reload();
  }

  onTailLineChange = (option: SelectOption) => {
    this.tailLines = option.value;
    this.reload();
  }

  formatOptionLabel = (option: SelectOption) => {
    const { value, label } = option;
    return label || <><Icon small material="view_carousel"/> {value}</>;
  }

  toggleTimestamps = () => {
    this.showTimestamps = !this.showTimestamps;
  }

  downloadLogs = () => {
    const { logs, newLogs } = this.getLogs();
    const fileName = this.selectedContainer.name + ".log";
    const fileContents = logs + newLogs;
    downloadFile(fileName, fileContents, "text/plain");
  }

  get containerSelectOptions() {
    return [
      {
        label: `Containers`,
        options: this.containers.map(container => {
          return { value: container.name }
        }),
      },
      {
        label: `Init Containers`,
        options: this.initContainers.map(container => {
          return { value: container.name }
        }),
      }
    ];
  }

  renderControlsPanel() {
    const { logsReady, showTimestamps } = this;
    if (!logsReady) return;
    const timestamps = this.getTimestamps(this.logs + this.newLogs);
    let from = "";
    let to = "";
    if (timestamps) {
      from = new Date(timestamps[0]).toLocaleString();
      to = new Date(timestamps[timestamps.length - 1]).toLocaleString();
    }
    return (
      <div className="controls flex align-center">
        <div className="time-range">
          {timestamps && `From <b>{from}</b> to <b>{to}</b>`}
        </div>
        <div className="control-buttons flex gaps">
          <Icon
            material="av_timer"
            onClick={this.toggleTimestamps}
            className={cssNames("timestamps-icon", { active: showTimestamps })}
            tooltip={(showTimestamps ? `Hide` : `Show`) + " " + `timestamps`}
          />
          <Icon
            material="save_alt"
            onClick={this.downloadLogs}
            tooltip={`Save`}
          />
        </div>
      </div>
    )
  }

  renderLogs() {
    if (!this.logsReady) {
      return <Spinner center/>
    }
    const { logs, newLogs } = this.getLogs();
    if (!logs && !newLogs) {
      return <p className="no-logs">`There are no logs available for container.`</p>
    }
    return (
      <>
        {logs}
        {newLogs && (
          <>
            <p className="new-logs-sep" title={`New logs since opening the dialog`}/>
            {newLogs}
          </>
        )}
      </>
    );
  }

  render() {
    const { ...dialogProps } = this.props;
    const { selectedContainer, tailLines } = this;
    const podName = this.data ? this.data.pod.getName() : "";
    const header = <h5>`{podName} Logs`</h5>;
    return (
      <Dialog
        {...dialogProps}
        isOpen={PodLogsDialog.isOpen}
        className="PodLogsDialog"
        onOpen={this.onOpen}
        onClose={this.onClose}
        close={this.close}
      >
        <Wizard header={header} done={this.close}>
          <WizardStep hideNextBtn prevLabel={`Close`}>
            <div className="log-controls flex gaps align-center justify-space-between">
              <div className="container flex gaps align-center">
                <span>`Container`</span>
                {selectedContainer && (
                  <Select
                    className="container-selector"
                    options={this.containerSelectOptions}
                    themeName="light"
                    value={{ value: selectedContainer.name }}
                    onChange={this.onContainerChange}
                    formatOptionLabel={this.formatOptionLabel}
                    autoConvertOptions={false}
                  />
                )}
                <span>`Lines`</span>
                <Select
                  value={tailLines}
                  options={this.lineOptions}
                  onChange={this.onTailLineChange}
                  themeName="light"
                />
              </div>
              {this.renderControlsPanel()}
            </div>
            <div className="logs-area" onScroll={this.onScroll} ref={e => this.logsArea = e}>
              {this.renderLogs()}
            </div>
          </WizardStep>
        </Wizard>
      </Dialog>
    )
  }
}
