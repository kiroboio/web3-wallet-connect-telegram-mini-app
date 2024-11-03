import crypto from 'crypto';

export const encrypt = (text: string, password: string) => {
  const salt = crypto.randomBytes(16);
  const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const encryptedData = {
    iv: iv.toString('hex'),
    salt: salt.toString('hex'),
    data: encrypted,
  };

  return JSON.stringify(encryptedData);
};

export const decrypt = (encryptedText: string, password: string) => {
  const { iv, salt, data } = JSON.parse(encryptedText);
  const key = crypto.pbkdf2Sync(password, Buffer.from(salt, 'hex'), 100000, 32, 'sha256');

  const decipher = crypto.createDecipheriv('aes-256-cbc', key, Buffer.from(iv, 'hex'));
  let decrypted = decipher.update(data, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
};