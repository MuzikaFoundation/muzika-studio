/**
 * Converts read data to block data.
 */

import * as crypto from 'crypto';
import { Transform } from 'stream';
import { BlockUtil } from '../../../../core/common/models/block';


export class BlockPaddingStream extends Transform {
  /**
   * BlockPaddingStream sends a data with padded and ensure to send a chunk with the multiple length of block size (16 bytes).
   */
  buffer: Buffer;
  length = 0;
  highWaterMark: number;
  dataReadLength = 0;
  frontGarbageSize: number;

  constructor(options) {
    super(options);
    this.highWaterMark = options.highWaterMark || 1024 * 1024;

    // buffer size should be over 256
    if (this.highWaterMark < 256) {
      throw new Error(`highWaterMark should be over 256.`);
    }

    // if buffer size length is not multiplied by BLOCK_SIZE
    if (this.highWaterMark % BlockUtil.BLOCK_SIZE) {
      throw new Error(`highWaterMark should be the multiple of ${BlockUtil.BLOCK_SIZE}.`);
    }

    this.buffer = new Buffer(this.highWaterMark);

    let frontGarbageSize;
    if (typeof options.frontGarbageSize === 'undefined' || options.frontGarbageSize == null) {
      frontGarbageSize = crypto.randomBytes(1);
    } else {
      frontGarbageSize = Buffer.alloc(1, options.frontGarbageSize);
    }
    this.frontGarbageSize = frontGarbageSize[0];
    this._bufferAppend(Buffer.concat([frontGarbageSize, crypto.randomBytes(frontGarbageSize[0])]));
  }

  _transform(data, encoding, callback) {
    this.dataReadLength += data.length;
    this._bufferAppend(data);
    callback();
  }

  _flush(callback) {
    const paddingValue = 16 - this.dataReadLength % 16;
    this._bufferAppend(Buffer.alloc(paddingValue, paddingValue));
    this._bufferAppend(crypto.randomBytes(255 - this.frontGarbageSize));
    this._sendBuffer();
    this.push(null);
    callback();
  }

  _bufferAppend(buf: Buffer) {
    // if buffer is full, push it
    while (this.length + buf.length >= this.highWaterMark) {
      buf.copy(this.buffer, this.length, 0, this.highWaterMark - this.length);
      buf = buf.slice(this.highWaterMark - this.length);
      this.length = this.highWaterMark;
      this._sendBuffer();
    }

    buf.copy(this.buffer, this.length);
    this.length += buf.length;
  }

  _sendBuffer() {
    this.push(Buffer.from(this.buffer.slice(0, this.length)));
    this.length = 0;
  }
}


export class BlockUnpaddingStream extends Transform {
  bufferQueue: Buffer[] = [];
  totalBufferLength = 0;
  frontGarbageSize: number = null;
  backGarbageSize: number = null;

  constructor(options) {
    super(options);
  }

  _transform(data, encoding, callback) {
    this._bufferAppend(data);
    callback();
  }

  _flush(callback) {
    this._flushBuffer();
    this.push(null);
    callback();
  }

  _bufferAppend(buf: Buffer) {
    if (this.frontGarbageSize === null) {
      this.frontGarbageSize = buf[0];
      this.backGarbageSize = 255 - this.frontGarbageSize;
      buf = buf.slice(1 + this.frontGarbageSize);
    }

    this.bufferQueue.push(buf);
    this.totalBufferLength += buf.length;

    while (this.totalBufferLength - this.bufferQueue[0].length >= this.backGarbageSize + 16) {
      this._sendBuffer();
    }
  }

  _sendBuffer() {
    const poppedBuffer = this.bufferQueue.shift();
    this.push(Buffer.from(poppedBuffer));
    this.totalBufferLength -= poppedBuffer.length;
  }

  _flushBuffer() {
    let mergedBuffer = Buffer.concat(this.bufferQueue);
    mergedBuffer = mergedBuffer.slice(0, mergedBuffer.length - this.backGarbageSize);
    mergedBuffer = mergedBuffer.slice(0, mergedBuffer.length - mergedBuffer[mergedBuffer.length - 1]);
    this.push(Buffer.from(mergedBuffer));
    this.totalBufferLength = 0;
  }
}
