import { Component } from '@angular/core';
import {BaseComponent, UserActions} from '@muzika/core/angular';
import { User } from '@muzika/core';
import {MuzikaTabs, TabService} from '../../providers/tab.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SideBarComponent extends BaseComponent {
  currentUser: User = null;
  currentTab: string;

  constructor(
    private tabService: TabService,
    private router: Router,
  ) {
    super();
  }

  ngOnInit() {
    this._sub.push(
      UserActions.currentUserObs.subscribe((user) => this.currentUser = user)
    );

    this._sub.push(
      this.tabService.tabChange.subscribe(tabName => this.currentTab = tabName)
    );
  }

  changeTab(tabName: MuzikaTabs, link: string) {
    this.currentTab = tabName;
    this.tabService.changeTab(tabName);
    this.router.navigate([link]);
  }
}
