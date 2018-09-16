import { Component } from '@angular/core';
import { MuzikaTabs } from '../../providers/tab.service';
import { BaseComponent } from '@muzika/core/angular';
import { PopupService } from '../../providers/popup.service';


@Component({
  selector: 'popup-layout',
  template: `
    <div class="popup">
      <div class="popup-background" (click)="deactivate()"></div>
      <router-outlet></router-outlet>
    </div>`,
  styles: [`
    :host {
      background: rgba(0, 0, 0, 0.5);
      position: absolute;
      width: 100%;
      height: 100%;
    }
    
    .popup {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .popup-background {
      position: absolute;
      width: 100%;
      height: 100%;
      background: transparent;
    }
  `]
})
export class PopupLayoutComponent extends BaseComponent {
  constructor(
    private popupService: PopupService,
  ) {
    super();
  }

  ngOnInit() {
  }

  deactivate() {
    this.popupService.deactivate();
  }
}
