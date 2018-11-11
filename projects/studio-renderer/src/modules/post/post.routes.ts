import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PostCommunityListComponent, PostMusicListComponent, PostVideoListComponent } from './pages/post-list/post-list';
import { PostCommunityItemDetailComponent, PostVideoItemDetailComponent } from './pages/post-item-detail/post-item-detail';
import { PostMusicWriteCompleteComponent } from './pages/post-write-complete/music/post-music-write-complete.component';
import { PostCommunityWriteComponent, PostVideoWriteComponent } from './pages/post-write/post-write';
import { PostCommunityModifyComponent, PostMusicModifyComponent, PostVideoModifyComponent } from './pages/post-modify/post-modify';
import { PostSheetMusicWriteComponent } from './pages/post-write/sheet/post-sheet-write.component';
import { PostStreamingMusicWriteComponent } from './pages/post-write/streaming/post-streaming-write.component';
import { PostMySheetsComponent } from './pages/post-my-sheets/post-my-sheets.component';
import { PostMyStreamingsComponent } from './pages/post-my-streamings/post-my-streamings.component';
import { PostStreamingItemDetailComponent } from './pages/post-item-detail/music/post-streaming-item-detail.component';
import { PostSheetItemDetailComponent } from './pages/post-item-detail/sheets/post-sheet-item-detail.component';
import { PostDraftListComponent } from './pages/post-draft-list/post-draft-list.component';
import { PostLayoutComponent } from './layout/post-layout.component';
import { PostSelectionComponent } from './pages/post-selection/post-selection.component';

const routes: Routes = [{
  path: 'board',
  component: PostLayoutComponent,
  children: [
    { path: 'select', component: PostSelectionComponent },
    { path: ':type/draft', component: PostDraftListComponent },
    { path: 'community/write', component: PostCommunityWriteComponent },
    { path: 'streaming/write', component: PostStreamingMusicWriteComponent },
    { path: 'streaming/write/complete', component: PostMusicWriteCompleteComponent },
    { path: 'sheet/write', component: PostSheetMusicWriteComponent },
    { path: 'sheet/write/complete', component: PostMusicWriteCompleteComponent },
    { path: 'video/write', component: PostVideoWriteComponent },

    { path: 'community/modify', component: PostCommunityModifyComponent },
    { path: 'music/modify', component: PostMusicModifyComponent },
    { path: 'video/modify', component: PostVideoModifyComponent },

    { path: 'sheet/my', component: PostMySheetsComponent },
    { path: 'streaming/my', component: PostMyStreamingsComponent },

    {
      path: 'community',
      component: PostCommunityListComponent,
      children: [{ path: ':id', component: PostCommunityItemDetailComponent }]
    },
    {
      path: 'streaming',
      component: PostMusicListComponent,
      children: [{ path: ':id', component: PostStreamingItemDetailComponent }]
    },
    {
      path: 'sheet',
      component: PostMusicListComponent,
      children: [{ path: ':id', component: PostSheetItemDetailComponent }]
    },
    {
      path: 'video',
      component: PostVideoListComponent,
      children: [{ path: ':id', component: PostVideoItemDetailComponent }]
    }
  ]
}];

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class AppPostRouteModule {
}
