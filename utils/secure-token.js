import crypto from 'crypto';

class SecureToken {
  static #algorithm = 'aes-256-ctr';

  static encryptToken(token) {
    const iv = crypto.randomBytes(16);
    const key = Buffer.from(process.env.TOKEN_SECURE_KEY, 'hex');
    const cipher = crypto.createCipheriv(this.#algorithm, key, iv);
    let encryptData = cipher.update(token, 'utf-8', 'hex');
    encryptData += (':' + iv.toString('hex'));
    return encryptData;
  }

  static decryptToken(encryptedData) {
    let [ encryptedToken, iv ] = encryptedData.split(':');
    iv = Buffer.from(iv, 'hex');
    const key = Buffer.from(process.env.TOKEN_SECURE_KEY, 'hex');
    const decipher = crypto.createDecipheriv(this.#algorithm, key, iv);
    const decryptedData = decipher.update(encryptedToken, 'hex', 'utf-8');
    return decryptedData;
  }
}

export default SecureToken;