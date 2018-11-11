import { Component } from '@angular/core';
import { BaseComponent, UserActions } from '@muzika/core/angular';
import { NavigationStart, Router } from '@angular/router';


@Component({
  selector: 'mzk-post-layout-topbar',
  template: `
    <div class="container-fluid top-flow">
      <div class="row">
        
        <div class="col flow flow-next" [class.finished]="level > 0" [class.active]="level == 0" (click)="goToPrev(0, '/board/select')">
          <i class="fas fa-check" *ngIf="level > 0"></i>
          <i class="fas fa-book-open" *ngIf="level == 0"></i>
          Select Type
        </div>

        <div class="col flow flow-next" [class.finished]="level > 1" [class.active]="level == 1" (click)="goToPrev(1, '/board/select')">
          <i class="fas fa-check" *ngIf="level > 1"></i>
          <i class="fas fa-receipt" *ngIf="level <= 1"></i> Music Info
        </div>
        
        <div class="col flow flow-next" [class.finished]="level > 2" [class.active]="level == 2" (click)="goToPrev(2, '/board/select')">
          <i class="fas fa-check" *ngIf="level > 2"></i>
          <i class="fas fa-upload" *ngIf="level <= 2"></i> Upload File
        </div>
  
        <div class="col flow" [class.finished]="level > 3" [class.active]="level == 3" (click)="goToPrev(3, '/board/select')">
          <i class="fas fa-check" *ngIf="level > 3"></i>
          <i class="fas fa-shopping-cart" *ngIf="level <= 3"></i> Deploy
        </div>
      </div>
    </div>
  `,
  styleUrls: [ './post-layout-topbar.component.scss' ]
})
export class PostLayoutTopbarComponent extends BaseComponent {
  currentPage = '';
  level = 0;

  constructor(
    private router: Router
  ) {
    super();
  }

  ngOnInit() {
    this._sub.push(
      this.router.events.subscribe((event) => {
        if (event instanceof NavigationStart) {
          this.currentPage = event.url.replace(/(\(.*\))|([?&].*=.*)/gi, '');

          switch (this.currentPage) {
            case '/board/select': this.level = 0; break;
            case '/board/sheet/write':
            case '/board/streaming/write': this.level = 1; break;
          }
        }
      })
    );
  }

  goToPrev(level: number, link: string) {
    if (level < this.level) {
      this.router.navigate([link]);
    }
  }
}
