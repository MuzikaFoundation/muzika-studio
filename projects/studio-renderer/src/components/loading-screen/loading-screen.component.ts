import { AfterViewInit, Component, OnInit } from '@angular/core';
import { remote } from 'electron';
import { IpcRendererService } from '../../providers/ipc-renderer.service';
import { IPCUtil } from '../../util/ipc-utils';


@Component({
  selector: 'loading-screen',
  templateUrl: './loading-screen.component.html',
  styleUrls: ['./loading-screen.component.scss']
})
export class LoadingScreenComponent implements OnInit, AfterViewInit {

  constructor(private ipcRendererService: IpcRendererService) {
  }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    // don't show before view initialized.
    remote.getCurrentWindow().show();
  }
}
