import { Component } from '@angular/core';
import {BaseComponent, UserActions} from '@muzika/core/angular';
import { User } from '@muzika/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SideBarComponent extends BaseComponent {
  currentUser: User = null;
  currentTab: string;

  constructor() {
    super();
  }

  ngOnInit() {
    this._sub.push(
      UserActions.currentUserObs.subscribe((user) => this.currentUser = user)
    );
  }

  changeTab(tapName: string) {
    this.currentTab = tapName;
  }
}
