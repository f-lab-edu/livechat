import * as crypto from 'crypto';

export interface StreamKeyPayload {
  loginId: string;
}

const ALGORITHM = 'aes-256-gcm';
const secret = process.env.STREAM_KEY_SECRET;
if (!secret) {
  throw new Error('STREAM_KEY_SECRET 환경변수가 설정되어 있지 않습니다.');
}
if (secret.length !== 32) {
  throw new Error('STREAM_KEY_SECRET는 32바이트(32글자)여야 합니다.');
}
const SECRET_KEY = Buffer.from(secret, 'utf8');

export function encryptStreamKey(payload: StreamKeyPayload): string {
  const iv = crypto.randomBytes(16); // 128비트 IV
  const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY, iv);

  const encrypted = Buffer.concat([cipher.update(JSON.stringify(payload), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag(); // GCM 모드용 인증 태그

  const combined = Buffer.concat([iv, tag, encrypted]);
  return combined.toString('base64').slice(16); // base64 인코딩된 stream key 반환
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
