import * as fs from 'fs';
import { MusicPostDraft, MuzikaConsole, promisify } from '../../../../core/common';

export class PostDraftBox {

  postDrafts = {
    community: {},
    video: {},
    streaming: {},
    sheet: {}
  };

  /**
   * Loads a draft box from file or constructs a new draftbox.
   *
   * @param {string} filePath draft box file path.
   * @param data JSON format string or object for draft box.
   */
  private constructor(filePath?: string, data?: string) {
    if (filePath) {
      promisify(fs.readFile, filePath).then(draftData => Object.assign(this.postDrafts, draftData));
    } else if (data) {
      Object.assign(this.postDrafts, (typeof data === 'string') ? JSON.parse(data) : data);
    }
  }

  /**
   * Constructs an empty draft box.
   *
   * @returns {PostDraftBox}
   */
  public static create() {
    return new PostDraftBox();
  }

  /**
   * Loads a draft box from local storage.
   *
   * @param {string} filePath
   * @returns {PostDraftBox}
   */
  public static loadFromFile(filePath: string) {
    const draftBox = new PostDraftBox(filePath);
    draftBox._validate();
    return draftBox;
  }

  /**
   * Loads a draft box from object or JSON string.
   *
   * @param {string | PostDraft} data object or JSON string with PostDraftBox format.
   * @returns {PostDraftBox}
   */
  public static loadFromJSON(data: string) {
    const draftBox = new PostDraftBox(null, data);
    draftBox._validate();
    return draftBox;
  }

  /**
   * Removes file paths if file does not exist in the current local storage in posts.
   *
   * @private
   */
  private _validate() {
    MuzikaConsole.log('Load Draft', this.postDrafts);

    Object.keys(this.postDrafts).forEach(postType => {
      Object.keys(this.postDrafts[postType]).forEach(draftId => {
        const musicPostDraft = <MusicPostDraft> this.postDrafts[postType][draftId];
        if (musicPostDraft.cover_image_path && !fs.existsSync(musicPostDraft.cover_image_path)) {
          musicPostDraft.cover_image_path = undefined;
        }

        // remove selling files that does not exist in the current storage.
        if (musicPostDraft.files) {
          musicPostDraft.files = musicPostDraft.files.filter((file) => {
            return !fs.existsSync(file.path);
          });

          // remove preview files that does not exist in the current storage.
          musicPostDraft.files.forEach((sellingFile) => {
            sellingFile.previews = sellingFile.previews.filter((file) => {
              return !fs.existsSync(file);
            });
          });
        }
      });
    });
  }
}
