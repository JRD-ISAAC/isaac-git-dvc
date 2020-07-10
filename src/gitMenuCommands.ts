import { JupyterFrontEnd } from '@jupyterlab/application';
import {
  Dialog,
  InputDialog,
  MainAreaWidget,
  showDialog,
  showErrorMessage
} from '@jupyterlab/apputils';
import { FileBrowser } from '@jupyterlab/filebrowser';
import { ISettingRegistry } from '@jupyterlab/settingregistry';
import { ITerminal } from '@jupyterlab/terminal';
import { IGitExtension } from './tokens';
import { doGitClone } from './widgets/gitClone';
import { SeldonDetailForm } from './widgets/SeldonDetailBox';

/**
 * The command IDs used by the git plugin.
 */
export namespace CommandIDs {
  export const gitUI = 'git:ui';
  export const gitTerminalCommand = 'git:terminal-command';
  export const gitInit = 'git:init';
  export const dvcInit = 'dvc:init';
  export const argoDeploy = 'argo:deploy';
  export const dvcFileAdd = 'dvc:filebrowser-add';
  export const seldonModelDeploy = 'seldon:model-deploy';
  export const gitOpenUrl = 'git:open-url';
  export const gitToggleSimpleStaging = 'git:toggle-simple-staging';
  export const gitAddRemote = 'git:add-remote';
  export const gitClone = 'git:clone';
}

/**
 * Add the commands for the git extension.
 */
export function addCommands(
  app: JupyterFrontEnd,
  model: IGitExtension,
  fileBrowser: FileBrowser,
  settings: ISettingRegistry.ISettings
) {
  const { commands, shell } = app;

  /**
   * Add open terminal in the Git repository
   */
  commands.addCommand(CommandIDs.gitTerminalCommand, {
    label: 'Open Git Repository in Terminal',
    caption: 'Open a New Terminal to the Git Repository',
    execute: async args => {
      const main = (await commands.execute(
        'terminal:create-new',
        args
      )) as MainAreaWidget<ITerminal.ITerminal>;

      try {
        if (model.pathRepository !== null) {
          const terminal = main.content;
          terminal.session.send({
            type: 'stdin',
            content: [`cd "${model.pathRepository.split('"').join('\\"')}"\n`]
          });
        }

        return main;
      } catch (e) {
        console.error(e);
        main.dispose();
      }
    }
  });

  /** Add open/go to git interface command */
  commands.addCommand(CommandIDs.gitUI, {
    label: 'Git Interface',
    caption: 'Go to Git user interface',
    execute: () => {
      try {
        shell.activateById('jp-git-sessions');
      } catch (err) {
        console.error('Fail to open Git tab.');
      }
    }
  });

  commands.addCommand(CommandIDs.dvcFileAdd, {
    label: 'DVC Add',
    iconClass: 'jp-MaterialIcon jp-AddIcon',
    caption: 'Start tracking selected file with DVC',
    execute: async () => {
      const splitRepoPath = model.pathRepository.split('/');
      const repoName = splitRepoPath[splitRepoPath.length - 1];
      const filepaths = [];
      const itemIterator = fileBrowser.selectedItems();
      let item = itemIterator.next();
      while (item) {
        const relativePathBegin = item.path.indexOf(repoName) + repoName.length;
        const path =
          '.' + item.path.substr(relativePathBegin, item.path.length);
        filepaths.push(path);
        item = itemIterator.next();
      }
      await model.dvc_add(...filepaths);
      // this.dvcAddFile(this.state.selectedFile.to);
    }
  });

  commands.addCommand(CommandIDs.seldonModelDeploy, {
    label: 'Deploy To Seldon',
    iconClass: 'jp-MaterialIcon jp-AddIcon',
    caption: 'Deploy the model file to seldon.',
    execute: async () => {
      const splitRepoPath = model.pathRepository.split('/');
      const repoName = splitRepoPath[splitRepoPath.length - 1];
      const itemIterator = fileBrowser.selectedItems();
      const item = itemIterator.next();

      const relativePathBegin = item.path.indexOf(repoName) + repoName.length;
      const path = '.' + item.path.substr(relativePathBegin, item.path.length);

      const result = await showDialog({
        title: 'Provide seldon model details: ',
        body: new SeldonDetailForm()
      });

      if (!result.button.accept) {
        console.log('User refuses to fill details.');
        return;
      }

      const seldonDetail = result.value;
      const res = await model.seldon_deploy(item.name, path, {
        model_name: seldonDetail.model_name,
        implementation: seldonDetail.implementation
      });
      if (!res.ok) {
        console.log(await res.text());
        return false;
      }
    }
  });

  /** Add git init command */
  commands.addCommand(CommandIDs.gitInit, {
    label: 'Init',
    caption: ' Create an empty Git repository or reinitialize an existing one',
    execute: async () => {
      const currentPath = fileBrowser.model.path;
      const result = await showDialog({
        title: 'Initialize a Repository',
        body: 'Do you really want to make this directory a Git Repo?',
        buttons: [Dialog.cancelButton(), Dialog.warnButton({ label: 'Yes' })]
      });

      if (result.button.accept) {
        await model.init(currentPath);
        model.pathRepository = currentPath;
      }
    }
  });

  /** Add dvc init command */
  commands.addCommand(CommandIDs.dvcInit, {
    label: 'DVC Init',
    caption: ' Initialize DVC repositor',
    execute: async () => {
      const currentPath = fileBrowser.model.path;
      const result = await showDialog({
        title: 'Initialize a DVC Repository',
        body: 'Do you really want to make this directory a DVC Repo?',
        buttons: [Dialog.cancelButton(), Dialog.warnButton({ label: 'Yes' })]
      });

      if (result.button.accept) {
        await model.dvc_init(currentPath);
        // model.pathRepository = currentPath;
      }
    }
  });

  /** Add dvc init command */
  commands.addCommand(CommandIDs.argoDeploy, {
    label: 'Send workflow',
    caption: 'Send and run workflow in Argo',
    execute: async () => {
      const currentPath = fileBrowser.model.path;
      const result = await showDialog({
        title: 'Send and run workflow in Argo',
        body: 'Do you really want to send this workflow to argo?',
        buttons: [Dialog.cancelButton(), Dialog.warnButton({ label: 'Yes' })]
      });

      if (result.button.accept) {
        await model.send_workflow(currentPath);
        // model.pathRepository = currentPath;
      }
    }
  });

  /** Open URL externally */
  commands.addCommand(CommandIDs.gitOpenUrl, {
    label: args => args['text'] as string,
    execute: args => {
      const url = args['url'] as string;
      window.open(url);
    }
  });

  /** add toggle for simple staging */
  commands.addCommand(CommandIDs.gitToggleSimpleStaging, {
    label: 'Simple staging',
    isToggled: () => !!settings.composite['simpleStaging'],
    execute: args => {
      settings.set('simpleStaging', !settings.composite['simpleStaging']);
    }
  });

  /** Command to add a remote Git repository */
  commands.addCommand(CommandIDs.gitAddRemote, {
    label: 'Add remote repository',
    caption: 'Add a Git remote repository',
    isEnabled: () => model.pathRepository !== null,
    execute: async args => {
      if (model.pathRepository === null) {
        console.warn('Not in a Git repository. Unable to add a remote.');
        return;
      }
      let url = args['url'] as string;
      const name = args['name'] as string;

      if (!url) {
        const result = await InputDialog.getText({
          title: 'Add a remote repository',
          placeholder: 'Remote Git repository URL'
        });

        if (result.button.accept) {
          url = result.value;
        }
      }

      if (url) {
        try {
          await model.addRemote(url, name);
        } catch (error) {
          console.error(error);
          showErrorMessage('Error when adding remote repository', error);
        }
      }
    }
  });

  /** Add git clone command */
  commands.addCommand(CommandIDs.gitClone, {
    label: 'Clone',
    caption: 'Clone a repository from a URL',
    isEnabled: () => model.pathRepository === null,
    execute: async () => {
      await doGitClone(model, fileBrowser.model.path);
      fileBrowser.model.refresh();
    }
  });
}
