
import * as secp256k1 from 'secp256k1';
import * as crypto from 'crypto';


export function createPrivateKey(): Buffer {
  let privKey = crypto.randomBytes(32);
  while (!secp256k1.privateKeyVerify(privKey)) {
    privKey = crypto.randomBytes(32);
  }

  return privKey;
}


export function getSharedSecret(remotePubKey: Buffer, privateKey: Buffer) {
  return secp256k1.ecdhUnsafe(remotePubKey, privateKey, true);
}


export function deriveSecretMaterial(sharedSecret: Buffer, keyDataLen: number) {
  const hashLength = 32;
  const reps = Math.ceil(keyDataLen / hashLength);
  const derivedHashes = [];

  for (let counter = 1; counter <= reps; ++counter) {
    const buffer = Buffer.allocUnsafe(4);
    buffer.writeUInt32BE(counter, 0);
    derivedHashes.push(crypto.createHash('sha256').update(buffer).update(sharedSecret).digest());
  }

  return Buffer.concat(derivedHashes).slice(0, keyDataLen);

}

export function bufxor(buf1: Buffer, buf2: Buffer) {
  const max = Math.max(buf1.length, buf2.length);
  const min = Math.min(buf1.length, buf2.length);
  const resultBuf = Buffer.alloc(max, 0x00);

  let i;
  for (i = 0; i < min; ++i) {
    resultBuf[i] = buf1[i] ^ buf2[i];
  }

  for (; i < max; ++i) {
    resultBuf[i] = ~(buf1[i] | buf2[i]);
  }

  return resultBuf;
}
