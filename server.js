// server.js
require('dotenv').config({ path: './.env.local' });

const { createServer } = require('http');
const next = require('next');
const { Server } = require('socket.io');
const { ObjectId } = require('mongodb');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// 데이터베이스 연결을 관리할 변수를 선언합니다.
let db;

app.prepare().then(async () => {
  // --- 데이터베이스 연결 로직 수정 ---
  // 서버가 시작될 때 데이터베이스 연결을 한번만 설정합니다.
  try {
    const { default: clientPromise } = await import('./lib/mongodb.js');
    const client = await clientPromise;
    db = client.db('datingApp');
    console.log("Successfully connected to MongoDB.");
  } catch (e) {
    console.error("Failed to connect to MongoDB", e);
    process.exit(1);
  }
  // --- 수정 끝 ---

  const httpServer = createServer((req, res) => {
    handle(req, res);
  });

  const io = new Server(httpServer);

  io.on('connection', (socket) => {
    console.log('Socket.IO: A user connected', socket.id);

    socket.on('join room', (roomId) => {
      socket.join(roomId);
      console.log(`Socket ${socket.id} joined room ${roomId}`);
    });

    socket.on('chat message', async (msg) => {
      try {
        // 미리 연결된 db 변수를 사용합니다.
        if (!db) {
          throw new Error("Database not initialized");
        }
        
        const savedMessage = {
          text: msg.text,
          authorId: new ObjectId(msg.authorId),
          authorName: msg.authorName, // 💥 수정: authorName을 함께 저장합니다.
          roomId: msg.roomId,
          timestamp: new Date(),
        };

        const result = await db.collection('messages').insertOne(savedMessage);
        
        // 새로 생성된 _id를 포함하여 클라이언트에 메시지를 전송합니다.
        const messageToSend = { ...savedMessage, _id: result.insertedId };
        
        io.to(msg.roomId).emit('chat message', messageToSend);

      } catch (error) {
        console.error('Error saving or broadcasting message:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log('Socket.IO: A user disconnected', socket.id);
    });
  });

  httpServer
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(3000, () => {
      console.log('> Ready on http://localhost:3000');
    });
});

