import { Component } from '@angular/core';
import { BaseComponent, UserActions } from '@muzika/core/angular';
import { remote } from 'electron';

@Component({
  selector: 'app-titlebar',
  templateUrl: './titlebar.component.html',
  styleUrls: ['./titlebar.component.scss']
})
export class TitleBarComponent extends BaseComponent {

  constructor(private userActions: UserActions) {
    super();
  }

  ngOnInit() {
  }

  // noinspection JSMethodCanBeStatic
  minimize() {
    remote.getCurrentWindow().minimize();
  }

  // noinspection JSMethodCanBeStatic
  maximize() {
    const window = remote.getCurrentWindow();
    const platform = (window as any).platform;
    const maximized = (platform === 'darwin') ? window.isFullScreen() : window.isMaximized();

    // On mac OS, let window to be full screen instead of maximizing.
    if (!maximized) {
      (platform === 'darwin') ? window.setFullScreen(true) : window.maximize();
    } else {
      (platform === 'darwin') ? window.setFullScreen(false) : window.unmaximize();
    }
  }

  // noinspection JSMethodCanBeStatic
  close(): void {
    remote.getCurrentWindow().close();
  }
}
