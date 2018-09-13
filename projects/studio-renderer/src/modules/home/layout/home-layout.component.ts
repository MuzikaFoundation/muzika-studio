import { Component } from '@angular/core';
import {BaseComponent, UserActions} from '@muzika/core/angular';
import { NavigationStart, Router } from '@angular/router';
import { User } from '@muzika/core';

@Component({
  selector: 'home-layout',
  templateUrl: './home-layout.component.html',
  styleUrls: ['./home-layout.component.scss']
})
export class HomeLayoutComponent extends BaseComponent {
  user: User;
  currentPage = '';

  constructor(private userActions: UserActions,
              private router: Router) {
    super();
  }

  ngOnInit() {
    this._sub.push(
      UserActions.currentUserObs.subscribe(user => {
        this.user = user;
        if (!user) {
          this.router.navigate(['/login']);
        }
      })
    );

    this.currentPage = this.router.url.replace(/(\(.*\))|([?&].*=.*)/gi, '');

    this._sub.push(
      this.router.events.subscribe((event) => {
        if (event instanceof NavigationStart) {
          this.currentPage = event.url.replace(/(\(.*\))|([?&].*=.*)/gi, '');
        }
      })
    );
  }

  logout() {
    this.userActions.logout();
  }
}
