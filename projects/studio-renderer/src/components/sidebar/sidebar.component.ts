import { Component } from '@angular/core';
import {BaseComponent, UserActions} from '@muzika/core/angular';
import { User } from '@muzika/core';
import {MuzikaTabs, TabService} from '../../providers/tab.service';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SideBarComponent extends BaseComponent {
  currentUser: User = null;
  currentMenu = 'home';

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
      this.router.events.subscribe((event) => {
        if (event instanceof NavigationEnd) {
          const url = event.url;
          if (url.startsWith('/home')) {
            this.currentMenu = 'home';
          } else if (url.startsWith('/board')) {
            this.currentMenu = 'studio';
          }
        }
      })
    );

  }

  changeMenu(link: any[]) {
    this.router.navigate(link);
  }
}
