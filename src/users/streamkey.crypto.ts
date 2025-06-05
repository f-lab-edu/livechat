import * as crypto from 'crypto';

export interface StreamKeyPayload {
  loginId: string;
}

const ALGORITHM = 'aes-256-gcm';
const SECRET_KEY = Buffer.from(process.env.STREAM_KEY_SECRET || 'default_secret_key_32_byte!!'); // 32바이트 필요

export function encryptStreamKey(payload: StreamKeyPayload): string {
  const iv = crypto.randomBytes(16); // 128비트 IV
  const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY, iv);

  const encrypted = Buffer.concat([cipher.update(JSON.stringify(payload), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag(); // GCM 모드용 인증 태그

  const combined = Buffer.concat([iv, tag, encrypted]);
  return combined.toString('base64'); // base64 인코딩된 stream key 반환
}

export function decryptStreamKey(streamKey: string): StreamKeyPayload {
  const data = Buffer.from(streamKey, 'base64');
  const iv = data.subarray(0, 16);
  const tag = data.subarray(16, 32);
  const encrypted = data.subarray(32);

  const decipher = crypto.createDecipheriv(ALGORITHM, SECRET_KEY, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return JSON.parse(decrypted.toString('utf8')) as StreamKeyPayload;
}
