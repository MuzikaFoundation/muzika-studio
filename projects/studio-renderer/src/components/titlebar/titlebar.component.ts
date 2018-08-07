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
    if (!window.isMaximized()) {
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
