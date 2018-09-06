import * as stream from 'stream';


/**
 * Streamify the Buffer instance.
 */
export class BufferStream extends stream.Readable {
  private _buffer: Buffer;
  private _currentIndex = 0;
  private _totalSize: number;

  constructor(buffer: Buffer, opts?: any) {
    super(opts);
    this._buffer = buffer;
    this._totalSize = this._buffer.length;
  }

  _read(size: number): void {
    if (this._currentIndex === this._totalSize) {
      this.push(null);
    } else if (this._currentIndex + size >= this._totalSize) {
      this.push(this._buffer.slice(this._currentIndex));
      this._currentIndex = this._totalSize;
    } else {
      this.push(this._buffer.slice(this._currentIndex, this._currentIndex + size));
      this._currentIndex += size;
    }
  }
}
