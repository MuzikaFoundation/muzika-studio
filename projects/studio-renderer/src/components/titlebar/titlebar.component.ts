import { Component } from '@angular/core';
import { BaseComponent } from '@muzika/core/angular';
import { remote } from 'electron';
import { fromEvent } from 'rxjs';

@Component({
  selector: 'app-titlebar',
  templateUrl: './titlebar.component.html',
  styleUrls: ['./titlebar.component.scss']
})
export class TitleBarComponent extends BaseComponent {
  isMaximized: boolean;

  constructor() {
    super();
  }

  ngOnInit() {
    const window = remote.getCurrentWindow();
    this.isMaximized = window.isMaximized();
    console.log(this.isMaximized);

    this._sub.push(
      fromEvent(window, 'maximize').subscribe(() => this.isMaximized = true)
    );

    this._sub.push(
      fromEvent(window, 'unmaximize').subscribe(() => this.isMaximized = false)
    );
  }

  // noinspection JSMethodCanBeStatic
  minimize() {
    remote.getCurrentWindow().minimize();
  }

  // noinspection JSMethodCanBeStatic
  toggleMaximize() {
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
