// lib/cloudinary.js

import { v2 as cloudinary } from 'cloudinary';

// .env.local 파일의 환경 변수를 사용하여 Cloudinary를 설정합니다.
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export default cloudinary;
