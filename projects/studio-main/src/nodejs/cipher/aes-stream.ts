/**
 * This class supports stream to encrypt or to decrypt by AES. Because of CBC encryption, the read chunk length should be the multiple
 * of initializer vector length (default 16)
 */

import * as aesjs from 'aes-js';
import * as crypto from 'crypto';
import { Transform } from 'stream';
import { BlockUtil } from '../../../../core/common/models/block';


export class AESCBCEncryptionStream extends Transform {
  prevVector: Buffer;
  blockSize: number;
  _aes: any;

  constructor(options) {
    super(options);
    this.prevVector = options.iv || crypto.randomBytes(BlockUtil.IV_SIZE);
    this.blockSize = this.prevVector.length;
    this._aes = new aesjs.AES(options.key);

    // if pushIv option is true or undefined, push IV to the front
    if (typeof options.pushIv === 'undefined' || options.pushIv) {
      this.push(this.prevVector);
    }
  }

  _transform(data, encoding, callback) {
    // if the data length is not multiplied by vector size
    if (data.length % this.blockSize) {
      callback(new Error(`invalid data length (data length : ${data.length})`));
    }

    for (let i = 0; i < data.length; i += this.blockSize) {
      // block XOR with previous vector
      for (let j = 0; j < this.blockSize; ++j) {
        data[i + j] ^= this.prevVector[j];
      }

      // block encryption
      this.prevVector = Buffer.from(this._aes.encrypt(data.slice(i, i + this.blockSize)));
      this.prevVector.copy(data, i);
    }

    this.push(data);
    callback();
  }

  _flush(callback) {
    this.push(null);
    callback();
  }
}


export class AESCBCDecryptionStream extends Transform {
  prevVector: Buffer;
  blockSize: number;
  _aes: any;

  constructor(options) {
    super(options);
    this.prevVector = options.iv;

    if (this.prevVector) {
      this.blockSize = this.prevVector.length;
    }

    this._aes = new aesjs.AES(options.key);
  }

  _transform(data, encoding, callback) {
    // if IV is not initialized, read IV from first buffer array.
    if (!this.prevVector) {
      this.prevVector = data.slice(0, BlockUtil.IV_SIZE);
      this.blockSize = this.prevVector.length;
      if (data.length === BlockUtil.IV_SIZE) {
        callback();
        return;
      } else {
        data = data.slice(BlockUtil.IV_SIZE);
      }
    }

    // if the data length is not multiplied by vector size
    if (data.length % this.blockSize) {
      callback(new Error(`invalid data length (data length : ${data.length})`), null);
    }

    for (let i = 0; i < data.length; i += this.blockSize) {
      const cipherBlock = Buffer.from(data.slice(i, i + this.blockSize));

      // block decryption
      Buffer.from(this._aes.decrypt(cipherBlock)).copy(data, i);

      // block XOR with previous vector
      for (let j = 0; j < this.blockSize; ++j) {
        data[i + j] ^= this.prevVector[j];
      }

      this.prevVector = cipherBlock;
    }

    this.push(data);
    callback();
  }

  _flush(callback) {
    this.push(null);
    callback();
  }
}

