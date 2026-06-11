// ================================================================
// Server-side configuration (mirrors backend/config/index.js)
// ================================================================

export const config = {
  PORT: parseInt(process.env.PORT || '3000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || '',

  JWT_SECRET: process.env.JWT_SECRET || 'super-secret-key-change-in-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',

  UPLOAD_DIR: process.env.UPLOAD_DIR || 'public/uploads',
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB

  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',

  R2_ENDPOINT: process.env.R2_ENDPOINT || '',
  R2_ACCESS_KEY: process.env.R2_ACCESS_KEY || '',
  R2_SECRET_KEY: process.env.R2_SECRET_KEY || '',
  R2_BUCKET_NAME: process.env.R2_BUCKET_NAME || '',
  R2_PUBLIC_URL: process.env.R2_PUBLIC_URL || '',

  STORAGE_PROVIDER: process.env.STORAGE_PROVIDER || 'local',

  PAYSTACK_SECRET_KEY: process.env.PAYSTACK_SECRET_KEY || '',
  PAYSTACK_PUBLIC_KEY: process.env.PAYSTACK_PUBLIC_KEY || '',

  SMTP_HOST: process.env.SMTP_HOST || '',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  SMTP_FROM: process.env.SMTP_FROM || 'noreply@artistportfol.io',

  CRYPTO_BTC_ADDRESS: process.env.CRYPTO_BTC_ADDRESS || '',
  CRYPTO_ETH_ADDRESS: process.env.CRYPTO_ETH_ADDRESS || '',
  CRYPTO_USDT_TRC20: process.env.CRYPTO_USDT_TRC20 || '',
  CRYPTO_USDT_ERC20: process.env.CRYPTO_USDT_ERC20 || '',

  BANK_NAME: process.env.BANK_NAME || '',
  BANK_ACCOUNT_NAME: process.env.BANK_ACCOUNT_NAME || '',
  BANK_ACCOUNT_NUMBER: process.env.BANK_ACCOUNT_NUMBER || '',

  ADMIN_NAME: process.env.ADMIN_NAME || 'Admin',
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@artistportfol.io',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'Admin@123',

  SITE_URL: process.env.SITE_URL || 'http://localhost:3000',
};
