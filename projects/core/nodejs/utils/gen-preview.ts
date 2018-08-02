
import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';
import * as im from 'imagemagick';
import { MuzikaConsole, promisify } from '@muzika/core';
import { EventEmitter } from 'events';

/**
 * GenPreview converts a PDF file into preview pages.
 */
export class GenPreview extends EventEmitter {
  static PROGRESS = {
    CONVERT_TO_PNG: 'convert',
    IMAGE_PROCESS: 'image-process'
  };

  private _pdfPath: string;
  private _tempDir: string;
  private _basename: string;
  private _previewFiles: string[];
  private _finishCount = 0;

  constructor(pdfPath: string, tempDir?: string) {
    super();

    if (path.extname(pdfPath) !== '.pdf') {
      throw new Error('extension should be .pdf');
    }

    this._pdfPath = pdfPath;

    // create a temporary directory if tempDir parameter is not defined.
    this._tempDir = (tempDir) ? tempDir : fs.mkdtempSync(path.join(os.tmpdir(), 'muzika-preview'));

    this._basename = path.basename(pdfPath, 'pdf');
  }

  /**
   * Converts a pdf file into preview files.
   * @returns {Promise<void>}
   */
  generate(): Promise<string[]> {
    this.emit('start');
    return promisify(im.convert, [this._pdfPath, path.join(this._tempDir, this._basename + '-%03d.png')])
      .then(() => {
        this.emit('progress', GenPreview.PROGRESS.CONVERT_TO_PNG, this.length);
        return promisify(fs.readdir, this._tempDir)
          .then(files => {
            files = files.map((file) => path.join(this._tempDir, file));
            this._previewFiles = files;

            // blur pages and return all preview files path.
            return Promise.all(files.map((file, index) => this._convert(file, index)))
              .then(() => {
                this.emit('finish');
                return this._previewFiles;
              });
          });
      });
  }

  /**
   * Deletes all temporary directory and files.
   * @returns {Promise<void>}
   */
  finalize(): Promise<void> {
    return promisify(fs.readdir, this._tempDir)
      .then(files => {
        files = files.map((file) => path.join(this._tempDir, file));
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
    return (Array.isArray(this._previewFiles)) ? this._previewFiles.length : 0;
  }

  /**
   * if pdf file has only one page, blur the half of the page or if it
   * has several pages, blur all pages excluding the first page.
   * @param {string} file the name of converted image
   * @param {number} index the page of the image in original PDF file.
   * @private
   */
  private _convert(file: string, index: number): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (index === 0) {
        if (this._previewFiles.length === 1) {
          // TODO: blur half
          return resolve();
        }

        // if it is first page and the PDF file has several pages, don't blur
        // the first page.
        return resolve();
      } else {
        // blur all pages excluding the first page
        promisify(im.convert, [file, '-blur', '5x5', file])
          .then(() => {
            this.emit('progress', GenPreview.PROGRESS.IMAGE_PROCESS, ++this._finishCount);
            return resolve();
          })
          .catch(err => console.log(err));
      }
    });
  }
}
