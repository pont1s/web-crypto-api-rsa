import {
  DEFAULT_CHAR_SIZE, DEFAULT_HASH_ALG, RSA_EXCHANGE_ALG, RSA_WRITE_ALG, SALT_LENGTH,
} from './constants';
import { normalizeBase64ToBuf, normalizeUnicodeToBuf } from './utils';
import { importPrivateKey, importPublicKey } from './keys';

import {
  CharSize, HashAlg, KeyUse, Msg, PrivateKey, PublicKey,
} from './types';

export async function sign(
  msg: Msg,
  privateKey: string | PrivateKey,
  charSize: CharSize = DEFAULT_CHAR_SIZE,
  hashAlg: HashAlg = DEFAULT_HASH_ALG,
): Promise<ArrayBuffer> {
  return window.crypto.subtle.sign(
    { name: RSA_WRITE_ALG, saltLength: SALT_LENGTH },
    typeof privateKey === 'string'
      ? await importPrivateKey(privateKey, hashAlg, KeyUse.Write)
      : privateKey,
    normalizeUnicodeToBuf(msg, charSize),
  );
}

export async function verify(
  msg: Msg,
  sig: Msg,
  publicKey: string | PublicKey,
  charSize: CharSize = DEFAULT_CHAR_SIZE,
  hashAlg: HashAlg = DEFAULT_HASH_ALG,
): Promise<boolean> {
  const verifyResult = await window.crypto.subtle.verify(
    { name: RSA_WRITE_ALG, saltLength: SALT_LENGTH },
    typeof publicKey === 'string'
      ? await importPublicKey(publicKey, hashAlg, KeyUse.Write)
      : publicKey,
    normalizeBase64ToBuf(sig),
    normalizeUnicodeToBuf(msg, charSize),
  );
  return verifyResult;
}

export async function encrypt(
  msg: Msg,
  publicKey: string | PublicKey,
  charSize: CharSize = DEFAULT_CHAR_SIZE,
  hashAlg: HashAlg = DEFAULT_HASH_ALG,
): Promise<ArrayBuffer> {
  const encryptResult = await window.crypto.subtle.encrypt(
    { name: RSA_EXCHANGE_ALG },
    typeof publicKey === 'string'
      ? await importPublicKey(publicKey, hashAlg, KeyUse.Exchange)
      : publicKey,
    normalizeUnicodeToBuf(msg, charSize),
  ) as ArrayBuffer;
  return encryptResult;
}

export async function decrypt(
  msg: Msg,
  privateKey: string | PrivateKey,
  hashAlg: HashAlg = DEFAULT_HASH_ALG,
): Promise<ArrayBuffer> {
  const normalized = normalizeBase64ToBuf(msg);
  const decryptResult = await window.crypto.subtle.decrypt(
    { name: RSA_EXCHANGE_ALG },
    typeof privateKey === 'string'
      ? await importPrivateKey(privateKey, hashAlg, KeyUse.Exchange)
      : privateKey,
    normalized,
  ) as ArrayBuffer;
  return decryptResult;
}
