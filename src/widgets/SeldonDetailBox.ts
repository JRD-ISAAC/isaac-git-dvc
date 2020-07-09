import { Dialog } from '@jupyterlab/apputils';
import { Widget } from '@lumino/widgets';
import { Git } from '../tokens';

/**
 * The UI for the commit author form
 */
export class SeldonDetailForm extends Widget
  implements Dialog.IBodyWidget<Git.ISeldonDetail> {
  constructor() {
    super();
    this.node.appendChild(this.createBody());
  }

  private createBody(): HTMLElement {
    const node = document.createElement('div');
    const text = document.createElement('span');
    this._model_name = document.createElement('input');
    this._implementation = document.createElement('select');

    node.className = 'jp-RedirectForm';
    text.textContent = 'Enter model name and pre-packaged server details';
    this._model_name.placeholder = 'Model name';

    const option1 = document.createElement('option');
    option1.value = 'SKLEARN_SERVER';
    option1.selected = true;
    option1.innerHTML = 'Scikit-learn Server';

    const option2 = document.createElement('option');
    option2.value = 'TENSORFLOW_SERVER';
    option2.innerHTML = 'Tensorflow Server';

    const option3 = document.createElement('option');
    option3.value = 'MLFLOW_SERVER';
    option3.innerHTML = 'MLflow Server';

    const option4 = document.createElement('option');
    option4.value = 'XGBOOST_SERVER';
    option4.innerHTML = 'XGBoost Server';

    this._implementation.appendChild(option1);
    this._implementation.appendChild(option2);
    this._implementation.appendChild(option3);
    this._implementation.appendChild(option4);

    node.appendChild(text);
    node.appendChild(this._model_name);
    node.appendChild(this._implementation);
    return node;
  }

  /**
   * Returns the input value.
   */
  getValue(): Git.ISeldonDetail {
    const seldonDetail = {
      model_name: this._model_name.value,
      implementation: this._implementation.value
    };
    return seldonDetail;
  }

  private _model_name: HTMLInputElement;
  private _implementation: HTMLSelectElement;
}
