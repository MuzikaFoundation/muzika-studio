import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommunityPost, MusicPost, MuzikaConsole, unitUp, User } from '@muzika/core';
import { BaseComponent, ExtendedWeb3, MuzikaCoin, UserActions } from '@muzika/core/angular';
import { combineLatest, from } from 'rxjs';
import { BestPostsMock, MusicSheetPostsMock, MusicStreamingPostsMock } from '../../mock/posts';

@Component({
  selector: 'web-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainPageComponent extends BaseComponent {
  musicSheets: MusicPost[] = MusicSheetPostsMock.slice(0, 5);
  musicStreamings: MusicPost[] = MusicStreamingPostsMock.slice(0, 5);
  posts: CommunityPost[] = BestPostsMock;

  topMusicSheets: MusicPost[];
  topMusicStreamings: MusicPost[];

  currentUser: User;
  balances: {
    mzk: number | string;
    dollar: number | string;
  };

  constructor(private muzikaCoin: MuzikaCoin,
              private router: Router,
              private web3: ExtendedWeb3) {
    super();
    this.topMusicSheets = this.musicSheets.slice(0, 3);
    this.topMusicStreamings = this.musicStreamings.slice(0, 3);
    this.balances = <any>{};
  }

  ngOnInit() {
    this.muzikaCoin.deployed();

    // this.router.navigateByUrl('/board/streaming/write');

    this._sub.push(
      combineLatest(
        from(this.muzikaCoin.deployed()),
        UserActions.currentUserObs
      ).subscribe(async ([coin, user]) => {
        MuzikaConsole.log('33', user);
        if (user) {
          const rawBalance = await coin.balanceOf(user.address);
          this.balances = {
            mzk: unitUp(rawBalance),
            // @TODO deploy muzika loyalty point
            dollar: 0
          };
        }
      })
    );
  }
}
