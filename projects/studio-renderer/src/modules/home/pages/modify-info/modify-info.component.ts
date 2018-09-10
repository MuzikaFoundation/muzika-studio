import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { BaseComponent, UserActions } from '@muzika/core/angular';
import { User } from '@muzika/core';
import { take } from 'rxjs/operators';


@Component({
  selector: 'modify-info',
  templateUrl: './modify-info.component.html',
  styleUrls: ['./modify-info.component.scss']
})
export class ModifyInfoComponent extends BaseComponent {
  user: User = <User>{};
  userNameWarning = false;

  constructor(
    private userAction: UserActions,
    private location: Location
  ) {
    super();
  }

  ngOnInit() {
    this._sub.push(
      UserActions.currentUserObs.pipe(take(1))
        .subscribe((user) => this.user = user)
    );
  }

  edit() {
    this.userAction.modifyUserInfo(this.user)
      .subscribe(
        () => this.goBack(),
        (err) => {
          // if the user name length is too short
          if (err.error.code === 10) {
            this.userNameWarning = true;
          }
        }
        );
  }

  goBack() {
    this.location.back();
  }
}
