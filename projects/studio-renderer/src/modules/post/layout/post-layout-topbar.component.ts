import { Component } from '@angular/core';


@Component({
  selector: 'mzk-post-layout-topbar',
  template: `
    <ul>
      <li>
        <h4 class="sidebar-branding">Artist Studio</h4>
      </li>
      <li>
        <a>
          <span class="fas fa-coins align-middle"></span>
          <span class="text">MZK Coins Revenue</span>
        </a>
      </li>
      <li>
        <a>
          <span class="fas fa-file-pdf align-middle"></span>
          <span class="text">Sheet Music Manages</span>
          <!--<span class="fas fa-chevron-down"></span>-->
        </a>
      </li>
      <li>
        <a>
          <span class="fas fa-music align-middle"></span>
          <span class="text">Song Manages</span>
          <!--<span class="fas fa-chevron-down"></span>-->
        </a>
      </li>
      <li>
        <a>
          <span class="fas fa-chart-bar align-middle"></span>
          <span class="text">User Analyze</span>
          <!--<span class="fas fa-chevron-down"></span>-->
        </a>
      </li>
    </ul>
  `,
  styleUrls: [ './post-layout-topbar.component.scss' ]
})
export class PostLayoutTopbarComponent {

}
