import * as crypto from 'crypto';
import * as secp256k1 from 'secp256k1';
import { Block } from '@muzika/core';
import * as cipherUtil from '../cipher/cipher-util';


export class BlockKey {
  block: Block;
  privateKey: Buffer;
  publicKey: Buffer;
  remotePubKey: Buffer;
  encryptedAESKey: Buffer = null;

  private constructor(block: Block, remotePubKey: Buffer = null) {
    this.block = block;
    this.generateKey();
    if (remotePubKey) {
      this.remotePubKey = remotePubKey;
    }
  }

  static forResponse(block: Block, remotePubKey: any) {
    // create a block key for response
    return new BlockKey(block, remotePubKey);
  }

  static forRequest(block: Block = null) {
    // create a block key for request server to send encrypted AES key.
    return new BlockKey(block);
  }

  getPrivateKey() {
    return this.privateKey.toString('hex');
  }

  getPublicKey() {
    return this.publicKey.toString('hex');
  }

  /**
   * Encrypt AES key by shared material.
   * XOR(AESkey, convertKey) = (sharedMaterial)
   * (convertKey) = XOR(AesKey, sharedMaterial)
   *
   * (encryptedKey) = AESEncrypt(ephAesKey, convertKey)
   */
  encryptAESKey() {
    if (!this.block || !this.block.isEncrypted()) {
      // if aes key is not set since the block is not encrypted, cannot encrypt
      throw new Error('The block is not encrypted');
    } else {
      const sharedSecret = cipherUtil.getSharedSecret(this.remotePubKey, this.privateKey);
      const material = cipherUtil.deriveSecretMaterial(sharedSecret, 80);
      const convertMaterial = cipherUtil.bufxor(material.slice(0, 32), this.block.aesKey);
      const ephAesKey = material.slice(32, 64);
      const iv = material.slice(64);
      const cipher = crypto.createCipheriv('aes-256-cbc', ephAesKey, iv);
      cipher.setAutoPadding(false);
      this.encryptedAESKey = cipher.update(convertMaterial);
    }
  }

  decryptAESKey() {
    if (!this.block) {
      throw new Error('The block does not exist.');
    } else {
      const sharedSecret = cipherUtil.getSharedSecret(this.remotePubKey, this.privateKey);
      const material = cipherUtil.deriveSecretMaterial(sharedSecret, 80);
      const ephAesKey = material.slice(32, 64);
      const iv = material.slice(64);
      const decipher = crypto.createDecipheriv('aes-256-cbc', ephAesKey, iv);
      decipher.setAutoPadding(false);
      this.block.aesKey = cipherUtil.bufxor(decipher.update(this.encryptedAESKey), material.slice(0, 32));
    }
  }

  receiveBlob(blob: Buffer, doDecryption: boolean = true) {
    // receive blob and translate block.
    this.encryptedAESKey = blob.slice(0, 32);
    this.remotePubKey = blob.slice(32, 64);

    // generate an encrypted block from binary
    this.block = Block.fromEncryptedData(blob.slice(64));
    this.decryptAESKey();

    if (doDecryption) {
      this.block.decrypt();
    }
  }

  sendBlob() {
    if (!this.encryptedAESKey) {
      this.encryptAESKey();
    }

    return Buffer.concat([this.encryptedAESKey, this.publicKey, this.block.data]);
  }

  private generateKey() {
    // creates a 256 bit ECC key
    this.privateKey = cipherUtil.createPrivateKey();
    this.publicKey = secp256k1.publicKeyCreate(this.privateKey, false);
  }
}
