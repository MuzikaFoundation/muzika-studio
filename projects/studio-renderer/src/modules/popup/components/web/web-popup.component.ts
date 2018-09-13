import { Component } from '@angular/core';
import { BaseComponent } from '@muzika/core/angular';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'web-popup',
  templateUrl: './web-popup.component.html',
  styleUrls: ['./web-popup.component.scss'],
})
export class WebPopupComponent extends BaseComponent {
  url: string;
  webview: any;

  constructor(
   private route: ActivatedRoute
  ) {
    super();
  }

  ngOnInit() {
    this.webview = document.querySelector('webview');

    this._sub.push(
      this.route.queryParams.subscribe(params => {
        this.url = params.url;
      })
    );

    this.webview.addEventListener('did-finish-load', this.onFinishLoad);
  }

  onFinishLoad() {
    console.log('finished!');
  }
}
