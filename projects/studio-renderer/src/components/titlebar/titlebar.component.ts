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
  platform: string;

  constructor() {
    super();
  }

  ngOnInit() {
    const window = remote.getCurrentWindow();
    this.isMaximized = window.isMaximized();
    this.platform = (window as any).platform;

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

    if (!this.isMaximized) {
      window.maximize();
    } else {
      window.unmaximize();
    }
  }

  // noinspection JSMethodCanBeStatic
  close(): void {
    remote.getCurrentWindow().close();
  }
}
