import { Component } from '@angular/core';
import {BaseComponent, UserActions} from '@muzika/core/angular';
import {Router} from '@angular/router';
import {State} from '@ngrx/store';
import {User} from '@muzika/core';


@Component({
  selector: 'home-layout',
  templateUrl: './home-layout.component.html',
  styleUrls: ['./home-layout.component.scss']
})
export class HomeLayoutComponent extends BaseComponent {
  user: User;

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
  }

  logout() {
    this.userActions.logout();
  }
}
