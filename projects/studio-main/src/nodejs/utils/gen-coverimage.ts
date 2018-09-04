
import * as fs from 'fs';
import * as path from 'path';
import * as im from 'imagemagick';
import { EventEmitter } from 'events';
import * as os from "os";
import { promisify } from '../../../../core/common';

/**
 * GenPreview converts a PDF file into preview pages.
 */
export class GenCoverimage extends EventEmitter {
  private _imagePath;
  private _tempDir;
  private _basename;
  private _coverFiles: string[] = [];
  private _totalCount = 0;
  private _finishCount = 0;

  constructor(imagePath: string, tempDir?: string) {
    super();

    this._imagePath = imagePath;

    // create a temporary directory if tempDir parameter is not defined.
    this._tempDir = (tempDir) ? tempDir : fs.mkdtempSync(path.join(os.tmpdir(), 'muzika-cover'));

    const ext = path.extname(imagePath);
    this._basename = path.basename(imagePath, ext.slice(1));
  }

  /**
   * Converts a pdf file into preview files.
   * @returns {Promise<void>}
   */
  generate(width: number, height: number): Promise<string> {
    this.emit('start', ++this._totalCount);

    const resultPath = path.join(this.tempDir, this._basename + '.png');
    return promisify(im.convert, [
      this._imagePath,
      `-resize ${width}x${height}`,
      resultPath
    ])
      .then(() => {
        this._coverFiles.push(resultPath);
        this.emit('finish', ++this._finishCount);
        return resultPath;
      });
  }

  /**
   * Deletes all temporary directory and files.
   * @returns {Promise<void>}
   */
  finalize(): Promise<void> {
    return promisify(fs.readdir, this._tempDir)
      .then(files => {
        files = files.map(file => path.join(this._tempDir, file));
        return Promise.all(files.map((file) => promisify(fs.unlink, file)))
          .then(() => promisify(fs.rmdir, this._tempDir));
      });
  }

  /**
   * Returns the temporary directory.
   * @returns {string} temporary directory.
   */
  get tempDir(): string {
    return this._tempDir;
  }

  /**
   * Returns the number of preview pages.
   * @returns {number} the number of previews.
   */
  get length(): number {
    return this._coverFiles.length;
  }

  /**
   * Returns all cover images.
   * @returns {string[]} cover image path array.
   */
  get coverImages(): string[] {
    return this._coverFiles;
  }
}
