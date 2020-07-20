import { Spinner } from '@jupyterlab/apputils';
import { Widget } from '@lumino/widgets';
import { AUTH_ERROR_MESSAGES } from '../git';
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
      .then(response => {
        this.handleResponse(response);
      })
      .catch(() => this.handleError());
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
      if (
        AUTH_ERROR_MESSAGES.map(
          message => response.message.indexOf(message) > -1
        ).indexOf(true) > -1
      ) {
        this.handleError(response.message);
        this.parent!.parent!.close(); // eslint-disable-line @typescript-eslint/no-non-null-assertion
      } else {
        this.handleError(response.message);
      }
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
    text.textContent = 'Operation completed successfully';
    label.appendChild(text);
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
      .then(response => {
        this.handleResponse(response);
      })
      .catch(() => this.handleError());
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
      if (
        AUTH_ERROR_MESSAGES.map(
          message => response.message.indexOf(message) > -1
        ).indexOf(true) > -1
      ) {
        this.handleError(response.message);
        this.parent!.parent!.close(); // eslint-disable-line @typescript-eslint/no-non-null-assertion
      } else {
        this.handleError(response.message);
      }
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
    text.textContent = 'Operation completed successfully';
    label.appendChild(text);
    this._body.appendChild(label);
  }
  private createBody(): HTMLElement {
    const node = document.createElement('div');
    node.className = 'jp-RedirectForm';
    return node;
  }
}
