import { Component } from '@angular/core';
import { APIConfig, BaseComponent, ExtendedWeb3, MuzikaCoin, UserActions } from '@muzika/core/angular';
import { Router } from '@angular/router';
import { combineLatest, from } from 'rxjs';
import { promisify, unitUp, User } from '@muzika/core';
import { ElectronService } from '../../../../providers/electron.service';


@Component({
  selector: 'wallet-info',
  templateUrl: './wallet-info.component.html',
  styleUrls: ['./wallet-info.component.scss']
})
export class WalletInfoComponent extends BaseComponent {
  user: User = null;
  balances: {
    eth: string;
    ethDollar: string;
    mzk: number | string;
    dollar: number | string;
    loyalty: number | string
  } = { eth: '', ethDollar: '', mzk: '', dollar: 0, loyalty: '' };

  // TODO: update exchange price (by dollar)
  exchangePrice = 0.1;

  constructor(
    private userActions: UserActions,
    private router: Router,
    private web3: ExtendedWeb3,
    private apiConfig: APIConfig,
    private muzikaCoin: MuzikaCoin,
    private electronService: ElectronService,
  ) {
    super();
  }

  ngOnInit() {
    this._sub.push(
      combineLatest(
        from(this.muzikaCoin.deployed()),
        UserActions.currentUserObs
      ).subscribe(async ([coin, user]) => {
        if (user) {
          this.user = user;

          console.log(this.apiConfig.apiUrl);
          combineLatest(
            from(promisify(this.web3.eth.getBalance, user.address)),
            from(coin.balanceOf(user.address)),
            from(this.apiConfig.get('/price/eth'))
          ).subscribe(([_ethBalance, _rawBalance, _ethPrice]) => {
            const ethBalance = (_ethBalance) ? _ethBalance.dividedBy(10 ** 18) : '';
            const ethDollar = (_ethPrice) ? ethBalance.mul((<any>_ethPrice).ethusd) : '';

            this.balances = {
              eth: ethBalance.toString(),
              ethDollar: ethDollar.toString(),
              mzk: unitUp(_rawBalance),
              dollar: parseFloat(unitUp(_rawBalance)) * this.exchangePrice,
              // @TODO deploy muzika loyalty point
              loyalty: 0
            };
          });
        } else {
          this.router.navigate(['/login']);
        }
      })
    );
  }

  queryAddress() {
    this.electronService.shell.openExternal(`https://etherscan.io/address/${this.user.address}`);
  }
}
