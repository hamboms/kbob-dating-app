// lib/mongodb.js

import { MongoClient } from 'mongodb';

// MongoDB 연결 URI. 보안을 위해 환경 변수에서 가져옵니다.
const uri = process.env.MONGODB_URI;
const options = {};

let client;
let clientPromise;

// MONGODB_URI가 .env.local 파일에 정의되지 않았다면 에러를 발생시킵니다.
if (!process.env.MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

// 개발 환경에서는 'global' 객체를 사용하여
// 핫 리로딩(Hot Reloading) 시에도 연결을 유지합니다.
// 이렇게 하면 매번 새로운 연결을 생성하는 것을 방지할 수 있습니다.
if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // 프로덕션 환경에서는 매번 새로운 연결을 생성하지 않고,
  // 한 번 생성된 연결을 계속 사용합니다.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// 다른 파일에서 MongoDB 클라이언트 연결을 가져다 쓸 수 있도록 export 합니다.
export default clientPromise;
