import {ManualProgress, ProgressSet, ProgressStream, StreamingUtil} from '../utils/index';
import * as path from 'path';
import { BlockPaddingStream } from '../cipher/block-stream';
import { AESCBCEncryptionStream } from '../cipher/aes-stream';
import * as fs from 'fs';
import { BufferStream } from '../utils/buffer-stream';
import { GenPreview } from '../utils/gen-preview';
import { MuzikaFileUtil } from './ipfs-upload.interface';
import * as os from 'os';
import * as IpfsAPI from 'ipfs-api';
import { GenCoverimage } from '../utils/gen-coverimage';
import { BlockUtil } from '../../../../core/common/models/block';
import { MuzikaConsole, MuzikaContractSummary, promisify } from '../../../../core/common';

export interface IpfsUploadTask {
  path: string;
  content: Buffer | ReadableStream;
  uploadProgress?: ProgressStream;
  fileType?: 'ipfs' | 'streaming' | 'cover';
}

export class MuzikaFileTask {
  progress: ManualProgress;
  tempDirs: string[] = [];

  constructor(private _mode: 'ipfs' | 'preview' | 'streaming' | 'coverImage',
              private _ipfsDirPath: string,
              private _fileBaseName: string,
              private _file: string | Buffer,
              private cipherKey: Buffer | null = null) {
    this.progress = new ManualProgress();
  }

  /**
   * Builds a file path with ipfs directory path, file basename and additional paths.
   *
   * @param args additional paths.
   * @returns {string} path with IPFS path format.
   */
  buildFilePath(...args): string {
    // joining path parameters and convert it into IPFS file path
    // if encryption is true, add "encrypted" extension to the file.
    return path.join(this._ipfsDirPath, this._fileBaseName, ...args)
      .replace(/\\/g, '/') + ((!!this.cipherKey) ? '.encrypted' : '');
  }

  /**
   * Builds a file content with file path or file data buffer.
   *
   * @param {string} ipfsPath IPFS path for the file.
   * @param {string | Buffer} file file path or file data buffer.
   * @returns {IpfsUploadTask}
   */
  buildFile(ipfsPath: string, file: string | Buffer): IpfsUploadTask {
    let fromStream;
    let progressStream;
    if (typeof file === 'string') {
      const stats = fs.statSync(file);
      progressStream = new ProgressStream({
        totalSize: (!!this.cipherKey) ? BlockUtil.getEncryptedSize(stats.size) : stats.size
      });
      fromStream = fs.createReadStream(file);
    } else {
      // maybe type is buffer.
      progressStream = new ProgressStream({
        totalSize: (!!this.cipherKey) ? BlockUtil.getEncryptedSize(file.length) : file.length
      });
      fromStream = new BufferStream(file);
    }

    // Although encryption parameter is true, don't encrypt if the cipher key not existing.
    return {
      path: ipfsPath,
      content:
        (!!this.cipherKey) ?
          fromStream
            .pipe(new BlockPaddingStream({}))
            .pipe(new AESCBCEncryptionStream({ key: this.cipherKey }))
            .pipe(progressStream)
          : fromStream.pipe(progressStream),
      uploadProgress: progressStream
    };
  }

  /**
   * Finalizes the task. It must be called after being uploaded to IPFS.
   *
   * @returns {Promise<void>}
   */
  finalize(): Promise<void> {
    return Promise.all(this.tempDirs.map(tempDir => MuzikaFileUtil.removeDirectory(tempDir)))
      .then(() => {
        this.tempDirs = [];
        return;
      });
  }

  /**
   * Preprocesses before uploading to IPFS.
   *
   * @returns {Promise<IpfsUploadTask[]>}
   */
  ready(): Promise<IpfsUploadTask[]> {
    // TODO: generate preview and cover image. It is already implemented but it needs imagemagick.
    switch (this._mode) {
      case 'ipfs':
        return this._readyIpfs();
      case 'preview':
        return Promise.resolve([]);
        // return this._readyPreview();
      case 'streaming':
        return this._readyStreaming();
      case 'coverImage':
        return Promise.resolve([]);
        // return this._readyCover();
    }
  }

  /**
   * Generates IPFS upload stream for uploading original file with encrypted.
   *
   * @returns {Promise<IpfsUploadTask[]>}
   * @private
   */
  private _readyIpfs(): Promise<IpfsUploadTask[]> {
      this.progress.setProgressPercent(1);
      return Promise.resolve([this.buildFile(this.buildFilePath(), this._file)]);
  }

  /**
   * Generates IPFS upload stream for previews.
   *
   * @returns {Promise<IpfsUploadTask[]>}
   * @private
   */
  private _readyPreview(): Promise<IpfsUploadTask[]> {
    if (this._file instanceof Buffer) {
      return Promise.reject(new Error('the file type should be file path string in generating preview task.'));
    }

    MuzikaConsole.log('Start to generate preview..');
    const genPreview = new GenPreview(this._file);
    genPreview.on('progress', (status, count) => {
      if (status === GenPreview.PROGRESS.CONVERT_TO_PNG) {
        this.progress.setProgressPercent(0.2);
      } else {
        this.progress.setProgressPercent(0.2 + count * 0.8 / genPreview.length);
      }
    });

    return genPreview.generate()
      .then(previewFiles => {
        this.tempDirs.push(genPreview.tempDir);
        this.progress.setProgressPercent(1);
        return previewFiles.map((previewFile, idx) => this.buildFile(this.buildFilePath(`${idx}.png`), previewFile));
      });
  }

  /**
   * Generates IPFS upload stream for streaming files.
   *
   * @returns {Promise<IpfsUploadTask[]>}
   * @private
   */
  private _readyStreaming(): Promise<IpfsUploadTask[]> {
    // generate a temporary directory for save streaming files generated
    const tempDir = os.tmpdir();

    return promisify(fs.mkdtemp, tempDir).then((tempDirPath) => {
      this.tempDirs.push(tempDirPath);

      return new Promise<IpfsUploadTask[]>((resolve, reject) => {
        if (this._file instanceof Buffer) {
          return reject(new Error('the file type should be file path string in streaming conversion task.'));
        }

        StreamingUtil.convert(this._file, StreamingUtil.VIDEO_OPTION.MIDDLE_QUALITY, tempDirPath).subscribe(
          (progress) => {
            MuzikaConsole.log(`Generating stream files for ${this._fileBaseName} (${progress.percent}%)`);
            this.progress.setProgressPercent(progress.percent / 100);
          },
          (err) => {
            throw err;
          },
          () => {
            promisify(fs.readdir, tempDirPath).then((streamingFiles) => {
              this.progress.setProgressPercent(1);

              MuzikaConsole.log(`Complete to generate public stream files for ${this._fileBaseName}`);
              return resolve(streamingFiles.map((streamingFile) =>
                this.buildFile(this.buildFilePath(streamingFile), path.join(tempDirPath, streamingFile))));
            });
          });
      });
    });
  }

  /**
   * Generates IPFS upload stream for the cover image.
   *
   * @returns {Promise<IpfsUploadTask[]>}
   * @private
   */
  private _readyCover(): Promise<IpfsUploadTask[]> {
    if (this._file instanceof Buffer) {
      return Promise.reject(new Error('the file type should be file path string in cover image task.'));
    }

    const genCover = new GenCoverimage(<string>this._file);
    this.tempDirs.push(genCover.tempDir);

    genCover.on('progress', (finishCount) => {
      this.progress.setProgressPercent(finishCount * 0.5);
    });

    return Promise.all([
      genCover.generate(MuzikaFileUtil.COVER_IMAGE.RECT.WIDTH, MuzikaFileUtil.COVER_IMAGE.RECT.HEIGHT),
      genCover.generate(MuzikaFileUtil.COVER_IMAGE.SQUARE.WIDTH, MuzikaFileUtil.COVER_IMAGE.SQUARE.HEIGHT)
    ])
      .then(() => {
        this.progress.setProgressPercent(1);
        return Promise.resolve(genCover.coverImages.map((file, index) =>
          this.buildFile(this.buildFilePath((index === 0) ? 'rect.png' : 'square.png'), file)
        ));
      });
  }
}

export interface OptionalMetaData {
  title?: string;
  description?: string;
  author?: string;
  authorAddress?: string;
}


export class MuzikaFileUploader {
  contractSummary: MuzikaContractSummary = {
    version: '1.0',
    type: 'unknown',
    title: '',
    description: '',
    author: '',
    authorAddress: '',
    coverImage: {},
    files: [],
    videos: []
  };

  readyProgress: ProgressSet;
  uploadProgress: ProgressSet;

  private _taskQueue: MuzikaFileTask[] = [];
  private _uploadQueue: any[] = [];
  private _cipherKey: Buffer;

  constructor(type: 'sheet' | 'music', cipherKey?: Buffer, meta?: OptionalMetaData) {
    this.contractSummary.type = type;
    this.contractSummary.title = meta.title || '';
    this.contractSummary.description = meta.description || '';
    this.contractSummary.author = meta.author || '';
    this.contractSummary.authorAddress = meta.authorAddress || '';
    this._cipherKey = (!!cipherKey) ? cipherKey : null;
    this.readyProgress = new ProgressSet();
    this.uploadProgress = new ProgressSet();
  }

  /**
   * Inserts a new file for the contract.
   *
   *
   * |   TYPE    |    FORMAT     | ENCRYPTION |
   * |-----------|---------------|------------|
   * |   media   | audio format  |     O      |
   * |   sheet   |     pdf       |     O      |
   * |   video   | video format  |     X      |
   * |  youtube  |     URL       |     X      |
   * |   cover   |    image      |     X      |
   *
   * @param {"media" | "sheet" | "video" | "youtube" | "cover"} fileType file type to insert.
   * @param {string} filePath real file path in local storage.
   * @param additional additional data for the file. If the file type is sheet, previews array that represents a preview image path for
   * the file can be added.
   */
  insert(fileType: 'media' | 'sheet' | 'video' | 'youtube' | 'cover', filePath: string, additional?: any) {
    const fileBaseName = path.basename(filePath);
    if (['media', 'sheet'].includes(fileType)) {
      this._taskQueue.push(new MuzikaFileTask('ipfs', '/ipfs', fileBaseName, filePath, this._cipherKey));
      this.contractSummary.files.push({
        type: MuzikaFileUtil.getFileType(fileBaseName),
        encrypted: true,
        hasPreview: fileType === 'sheet',
        streamingSupportList: [],
        path: `${MuzikaFileUtil.ORIGIN_FILE_DIRECTORY}/${fileBaseName}`
      });
    }

    if (fileType === 'media') {
      this._taskQueue.push(new MuzikaFileTask(
        'streaming',
        `${MuzikaFileUtil.STREAMING_FILE_DIRECTORY}`,
        fileBaseName,
        filePath,
        this._cipherKey)
      );
    }

    switch (fileType) {
      case 'sheet':
        if (additional && additional.previews) {
          // if preview images exist, just add the file.
          this._taskQueue.push(additional.previews.map((preview, idx) =>
            new MuzikaFileTask(
              'ipfs',
              `${MuzikaFileUtil.PREVIEW_FILE_DIRECTORY}/${fileBaseName}`,
              `${idx}${path.extname(filePath)}`,
              `${filePath}`))
          );
        } else {
          // if preview images don't exist, add automatically.
          this._taskQueue.push(new MuzikaFileTask(
            'preview',
            `${MuzikaFileUtil.PREVIEW_FILE_DIRECTORY}`,
            fileBaseName,
            filePath,
            null)
          );
        }
        break;
      case 'video':
        this._taskQueue.push(new MuzikaFileTask(
          'streaming',
          `${MuzikaFileUtil.STREAMING_FILE_DIRECTORY}`,
          fileBaseName,
          filePath,
          null)
        );
        this.contractSummary.videos.push({ type: 'ipfs', path: `/streaming/${fileBaseName}` });
        break;
      case 'youtube':
        this.contractSummary.videos.push({ type: 'youtube', path: filePath });
        break;
      case 'cover':
        this._taskQueue.push(new MuzikaFileTask(
          'coverImage',
          `${MuzikaFileUtil.COVER_FILE_DIRECTORY}`,
          '',
          filePath,
          null)
        );
        Object.assign(this.contractSummary.coverImage, {
          'rect': '/cover/rect.png',
          'square': '/cover/square.png'
        });
    }
  }

  /**
   * Preprocesses for all files inserted.
   *
   * @returns {Promise<void>}
   */
  ready(): Promise<void> {
    this._taskQueue.forEach(task => this.readyProgress.registerProgress(task.progress));
    MuzikaConsole.log('Tasking before uploading files to IPFS.', this._taskQueue);

    return Promise.all(this._taskQueue.map(task => task.ready()))
      .then((uploadTasks) => {
        uploadTasks.forEach((uploadObjects) => {
          this._uploadQueue.push(...uploadObjects);
          this.uploadProgress.registerProgress(...uploadObjects.map((uploadObject) => uploadObject.uploadProgress));
        });

        this._uploadQueue.push({
          path: '/meta.json',
          content: Buffer.from(JSON.stringify(this.contractSummary))
        });

        return Promise.resolve();
      });
  }

  /**
   * Upload to the IPFS. It must be called after ready finished.
   * @param {IpfsAPI} ipfs ipfs node instance.
   * @returns {Promise<any[]>} array that has all ipfs-uploaded objects.
   */
  upload(ipfs: IpfsAPI): Promise<any[]> {
    return ipfs.files.add(this._uploadQueue, { wrapWithDirectory: true })
      // Regardless of success or fail, finalize all tasks
      .finally(() => this._taskQueue.forEach(task => task.finalize()));
  }
}
