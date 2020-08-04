import { Spinner } from '@jupyterlab/apputils';
import { Widget } from '@lumino/widgets';
import { Git, IGitExtension } from '../tokens';

/**
 * The UI for the content shown within workflow send modal.
 */
export class SendWorkflowDialog extends Widget {
  private _spinner: Spinner;
  private _model: IGitExtension;
  private _body: HTMLElement;

  /**
   * Instantiates the dialog and makes the relevant service API call.
   */
  constructor(model: IGitExtension, currentPath: string) {
    super();
    this._model = model;

    this._body = this.createBody();
    this.node.appendChild(this._body);

    this._spinner = new Spinner();
    this.node.appendChild(this._spinner.node);

    this._model
      .send_workflow(currentPath)
      .then(response => this.handleResponse(response))
      .catch(response => this.handleResponse(response));
  }

  /**
   * Handles the response from the server by removing the _spinner and showing the appropriate
   * success or error message.
   * @param response the response from the server API call
   */
  private async handleResponse(response: Git.IPushPullResult) {
    this.node.removeChild(this._spinner.node);
    this._spinner.dispose();
    if (response.code !== 200) {
      this.handleError(response.message);
    } else {
      this.handleSuccess(response);
    }
  }

  private handleError(
    message = 'Unexpected failure. Please check your Jupyter server logs for more details.'
  ): void {
    const label = document.createElement('label');
    const text = document.createElement('span');
    text.textContent = 'Operation failed with error:';
    const errorMessage = document.createElement('span');
    errorMessage.textContent = message;
    errorMessage.setAttribute(
      'style',
      'background-color:var(--jp-rendermime-error-background)'
    );
    label.appendChild(text);
    label.appendChild(document.createElement('p'));
    label.appendChild(errorMessage);
    this._body.appendChild(label);
  }

  private handleSuccess(response: Git.IPushPullResult): void {
    const label = document.createElement('label');
    const text = document.createElement('span');
    const link = document.createElement('a');
    const { metadata } = (response.message as unknown) as Git.IWorkflowResult;
    const workflowUrl = `https://pipelines.isaac.jnj.com/workflows/default/${
      metadata.name
    }`;

    link.setAttribute('href', workflowUrl);
    link.setAttribute('target', '_blank');
    link.style.color = 'blue';
    link.innerHTML = 'Click here for seeing your result';
    text.textContent = `Worflow "${metadata.name}" scheduled successfully. `;
    label.appendChild(text);
    label.appendChild(link);
    this._body.appendChild(label);
  }
  private createBody(): HTMLElement {
    const node = document.createElement('div');
    node.className = 'jp-RedirectForm';
    return node;
  }
}

/**
 * The UI for the content shown within seldon deploy modal.
 */
export class SeldonDeployDialog extends Widget {
  private _spinner: Spinner;
  private _model: IGitExtension;
  private _body: HTMLElement;
  private _seldon_detail: Git.ISeldonDetail;

  /**
   * Instantiates the dialog and makes the relevant service API call.
   */
  constructor(
    model: IGitExtension,
    filename: string,
    filepath: string,
    seldon_detail: Git.ISeldonDetail
  ) {
    super();
    this._model = model;

    this._body = this.createBody();
    this.node.appendChild(this._body);

    this._spinner = new Spinner();
    this.node.appendChild(this._spinner.node);

    this._model
      .seldon_deploy(filename, filepath, seldon_detail)
      .then(response => this.handleResponse(response))
      .catch(response => this.handleResponse(response));

    this._seldon_detail = seldon_detail;
  }

  /**
   * Handles the response from the server by removing the _spinner and showing the appropriate
   * success or error message.
   * @param response the response from the server API call
   */
  private async handleResponse(response: Git.IPushPullResult) {
    this.node.removeChild(this._spinner.node);
    this._spinner.dispose();
    if (response.code !== 0) {
      this.handleError(response.message);
    } else {
      this.handleSuccess();
    }
  }

  private handleError(
    message = 'Unexpected failure. Please check your Jupyter server logs for more details.'
  ): void {
    const label = document.createElement('label');
    const text = document.createElement('span');
    text.textContent = 'Operation failed with error:';
    const errorMessage = document.createElement('span');
    errorMessage.textContent = message;
    errorMessage.setAttribute(
      'style',
      'background-color:var(--jp-rendermime-error-background)'
    );
    label.appendChild(text);
    label.appendChild(document.createElement('p'));
    label.appendChild(errorMessage);
    this._body.appendChild(label);
  }

  private handleSuccess(): void {
    const label = document.createElement('label');
    const text = document.createElement('span');
    const modelName = this._seldon_detail.model_name;
    const link = document.createElement('a');
    const seldonUrl = `https://models.isaac.jnj.com/seldon-deploy/deployments/dashboard?namespace=seldon&name=${modelName}&kind=SeldonDeployment`;
    link.setAttribute('href', seldonUrl);
    link.setAttribute('target', '_blank');
    link.style.color = 'blue';
    link.innerHTML = 'Click here for seeing your result';
    text.textContent = 'Model scheduled. ';
    label.appendChild(text);
    label.appendChild(link);
    this._body.appendChild(label);
  }
  private createBody(): HTMLElement {
    const node = document.createElement('div');
    node.className = 'jp-RedirectForm';
    return node;
  }
}
