import React from "react";
import {observer} from "mobx-react";
import {observable} from "mobx";
import {Dialog, DialogProps} from "@pskishere/piral-compass-dialog";
import {Wizard, WizardStep} from "@pskishere/piral-compass-wizard";
import {SubTitle} from "@pskishere/piral-compass-sub-title";
import {SelectOption} from "@pskishere/piral-compass-select";
import {Notifications} from "@pskishere/piral-compass-notifications";
// import {NodeSelect} from "compass-base/client/components/+nodes";
import {apiBase, Namespace} from "@pskishere/piral-compass-api";


interface NodeResourceLimit {
  zone: string;
  rack: string;
  host: string;
}

interface Props extends Partial<DialogProps> {
}

@observer
export class NamespaceNodeRangeLimitDialog extends React.Component<Props> {

  @observable static isOpen = false;
  @observable static namespace: Namespace;
  @observable nodes = observable.array<any>([], {deep: false});

  static open(namespace: Namespace) {
    NamespaceNodeRangeLimitDialog.isOpen = true;
    NamespaceNodeRangeLimitDialog.namespace = namespace;
  }

  static close() {
    NamespaceNodeRangeLimitDialog.isOpen = false;
  }

  close = () => {
    NamespaceNodeRangeLimitDialog.close();
  }

  reset = () => {
    this.nodes = observable.array<any>([], {deep: false});
  }

  onOpen = () => {
    let nodeResourceLimitTemps: NodeResourceLimit[] = [];
    NamespaceNodeRangeLimitDialog.namespace.getAnnotations().map(annotation => {
      const annotationKeyValue = annotation.split("=");
      if (annotationKeyValue[0] == "nuwa.kubernetes.io/default_resource_limit") {
        nodeResourceLimitTemps = JSON.parse(annotationKeyValue[1]);
      }
    })
    nodeResourceLimitTemps.map(node => {
      if (this.nodes === null) {
        this.nodes = observable.array<any>([], {deep: false})
      }
      ;
      this.nodes.push(node.host)
    })
  }

  updateAnnotate = async () => {
    const data = {
      namespace: NamespaceNodeRangeLimitDialog.namespace.getName(),
      nodes: new Array<string>()
    };
    this.nodes.map(node => {
      data.nodes.push(node);
    })

    try {
      await apiBase.post("/namespaces/annotation/node", {data}).then((data) => {
        this.close();
      })
      Notifications.ok(
        <>{NamespaceNodeRangeLimitDialog.namespace.getName()} annotation succeeded</>)
      ;
    } catch (err) {
      Notifications.error(err);
    }
  }

  render() {
    const {...dialogProps} = this.props;
    const unwrapNodes = (options: SelectOption[]) => options.map(option => option.value);
    const header = <h5>`Annotate Node`</h5>;
    return (
      <Dialog
        {...dialogProps}
        className="NamespaceNodeRangeLimitDialog"
        isOpen={NamespaceNodeRangeLimitDialog.isOpen}
        onOpen={this.onOpen}
        close={this.close}
      >
        <Wizard header={header} done={this.close}>
          <WizardStep contentClass="flow column" nextLabel={`Annotate`}
                      next={this.updateAnnotate}>
            <div className="node">
              <SubTitle title={`Annotate Node`}/>
              {/* <NodeSelect
                isMulti
                value={this.nodes}
                placeholder={`Node`}
                themeName="light"
                className="box grow"
                onChange={(opts: SelectOption[]) => {
                  if (!opts) opts = [];
                  this.nodes.replace(unwrapNodes(opts));
                }}
              /> */}
            </div>
          </WizardStep>
        </Wizard>
      </Dialog>
    )
  }
}