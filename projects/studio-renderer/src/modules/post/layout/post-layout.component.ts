import { Component } from '@angular/core';


@Component({
  selector: 'mzk-post-layout',
  template: `
    <div class="container post-layout">
      <mzk-post-layout-topbar></mzk-post-layout-topbar>
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      background: #EEEEEE;
      padding: 10px 0;
      height: 100%;
    }
    
    .post-layout {
      height: 100%;
      display: flex;
      flex-direction: column;
    }
  `]
})
export class PostLayoutComponent {
}
