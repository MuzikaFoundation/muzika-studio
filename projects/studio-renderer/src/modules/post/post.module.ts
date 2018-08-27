import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material';
import { BrowserModule } from '@angular/platform-browser';
import { MuzikaCommonModule, MuzikaCoreModule } from '@muzika/core/angular';
import { FroalaEditorModule, FroalaViewModule } from 'angular-froala-wysiwyg';
import { PostCommentComponent } from './components/post-comment/post-comment.component';
import { PostItemDetailHeaderComponent } from './components/post-item-detail-header/post-item-detail-header.component';
import { PostListItemComponent } from './components/post-list-item/post-list-item.component';
import { PostMusicComponent } from './components/post-music/post-music.component';
import { PostCommunityItemDetailComponent, PostVideoItemDetailComponent } from './pages/post-item-detail/post-item-detail';
import { PostCommunityListComponent, PostMusicListComponent, PostVideoListComponent } from './pages/post-list/post-list';
import { PostCommunityModifyComponent, PostMusicModifyComponent, PostVideoModifyComponent } from './pages/post-modify/post-modify';
import { PostMusicWriteCompleteComponent } from './pages/post-write-complete/music/post-music-write-complete.component';
import { PostCommunityWriteComponent, PostVideoWriteComponent } from './pages/post-write/post-write';
import { AppPostRouteModule } from './post.routes';
import { YoutubeVideoCellComponent } from './components/youtube-video-cell/youtube-video-cell.component';
import { PostSheetMusicWriteComponent } from './pages/post-write/sheet/post-sheet-write.component';
import { PostStreamingMusicWriteComponent } from './pages/post-write/streaming/post-streaming-write.component';
import { PostMyStreamingsComponent } from './pages/post-my-streamings/post-my-streamings.component';
import { PostMySheetsComponent } from './pages/post-my-sheets/post-my-sheets.component';
import { PostStreamingItemDetailComponent } from './pages/post-item-detail/music/post-streaming-item-detail.component';
import { PostSheetItemDetailComponent } from './pages/post-item-detail/sheets/post-sheet-item-detail.component';
import { PostDraftListComponent } from './pages/post-draft-list/post-draft-list.component';
import { PostLayoutComponent } from './layout/post-layout.component';
import { PostLayoutTopbarComponent } from './layout/post-layout-topbar.component';
import { NgxUploaderModule } from 'ngx-uploader';
import { PostNotReadyComponent } from './pages/post-not-ready/post-not-ready.component';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    MuzikaCommonModule,

    AppPostRouteModule,

    MuzikaCoreModule,
    MatButtonModule,
    NgxUploaderModule,

    FroalaEditorModule.forRoot(),
    FroalaViewModule.forRoot()
  ],
  declarations: [

    PostListItemComponent,
    PostMusicComponent,
    PostItemDetailHeaderComponent,

    PostSheetItemDetailComponent,
    PostCommentComponent,

    YoutubeVideoCellComponent,

    PostLayoutComponent,
    PostLayoutTopbarComponent,

    /* Pages */
    PostNotReadyComponent,

    PostDraftListComponent,
    PostCommunityListComponent,
    PostCommunityItemDetailComponent,
    PostCommunityModifyComponent,
    PostCommunityWriteComponent,

    PostMusicListComponent,
    PostStreamingItemDetailComponent,
    PostStreamingMusicWriteComponent,
    PostMusicModifyComponent,
    PostMusicWriteCompleteComponent,

    PostSheetMusicWriteComponent,

    PostMyStreamingsComponent,
    PostMySheetsComponent,


    PostVideoListComponent,
    PostVideoItemDetailComponent,
    PostVideoWriteComponent,
    PostVideoModifyComponent
  ],
  exports: [
    PostListItemComponent,
    PostMusicComponent
  ]
})
export class PostModule {

}
