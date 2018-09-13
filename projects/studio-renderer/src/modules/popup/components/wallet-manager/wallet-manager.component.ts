import { Component } from '@angular/core';
import { BaseComponent } from '@muzika/core/angular';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'wallet-manager',
  templateUrl: './wallet-manager.component.html',
  styleUrls: ['./wallet-manager.component.scss'],
})
export class WalletManagerComponent extends BaseComponent {
  constructor(
   private route: ActivatedRoute
  ) {
    super();
  }

  ngOnInit() {
  }
}
