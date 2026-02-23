require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const storage = require('node-persist');

const app = express();
app.use(cors());
app.use(express.json());

const SECRET = process.env.SECRET_KEY || 'dev-secret';
const PORT = process.env.PORT || 10000;

async function initStorage() {
  await storage.init({ dir: './data', stringify: JSON.stringify, parse: JSON.parse, logging: false });
  const keys = ['users', 'posts', 'messages', 'counters'];
  for (const k of keys) {
    const v = await storage.getItem(k);
    if (!v) await storage.setItem(k, k === 'counters' ? { userId: 1, postId: 1, msgId: 1 } : []);
  }
}

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing token' });
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.post('/auth/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });
  const users = await storage.getItem('users');
  if (users.find(u => u.username === username)) return res.status(400).json({ error: 'username exists' });
  const hash = await bcrypt.hash(password, 8);
  const counters = await storage.getItem('counters');
  const user = { id: counters.userId++, username, password: hash, createdAt: new Date().toISOString() };
  users.push(user);
  await storage.setItem('users', users);
  await storage.setItem('counters', counters);
  const token = jwt.sign({ id: user.id, username: user.username }, SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, username: user.username } });
});

app.post('/auth/login', async (req, res) => {
  const { username, password } = req.body;
  const users = await storage.getItem('users');
  const user = users.find(u => u.username === username);
  if (!user) return res.status(400).json({ error: 'invalid credentials' });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(400).json({ error: 'invalid credentials' });
  const token = jwt.sign({ id: user.id, username: user.username }, SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, username: user.username } });
});

app.get('/users', async (_req, res) => {
  const users = await storage.getItem('users');
  res.json(users.map(u => ({ id: u.id, username: u.username }))); 
});

app.get('/posts', async (_req, res) => {
  const posts = await storage.getItem('posts');
  res.json(posts);
});

app.post('/posts', authMiddleware, async (req, res) => {
  const { content } = req.body;
  if (!content) return res.status(400).json({ error: 'content required' });
  const posts = await storage.getItem('posts');
  const counters = await storage.getItem('counters');
  const post = { id: counters.postId++, authorId: req.user.id, content, likes: 0, createdAt: new Date().toISOString() };
  posts.unshift(post);
  await storage.setItem('posts', posts);
  await storage.setItem('counters', counters);
  res.json(post);
});

app.post('/posts/:id/like', authMiddleware, async (req, res) => {
  const id = Number(req.params.id);
  const posts = await storage.getItem('posts');
  const p = posts.find(x => x.id === id);
  if (!p) return res.status(404).json({ error: 'post not found' });
  p.likes = (p.likes || 0) + 1;
  await storage.setItem('posts', posts);
  res.json({ id: p.id, likes: p.likes });
});

app.post('/messages', authMiddleware, async (req, res) => {
  const { toId, text } = req.body;
  if (!toId || !text) return res.status(400).json({ error: 'toId and text required' });
  const messages = await storage.getItem('messages');
  const counters = await storage.getItem('counters');
  const msg = { id: counters.msgId++, fromId: req.user.id, toId, text, createdAt: new Date().toISOString() };
  messages.push(msg);
  await storage.setItem('messages', messages);
  await storage.setItem('counters', counters);
  res.json(msg);
});

app.get('/messages', authMiddleware, async (req, res) => {
  const messages = await storage.getItem('messages');
  const userMessages = messages.filter(m => m.fromId === req.user.id || m.toId === req.user.id);
  res.json(userMessages);
});

async function start() {
  await initStorage();
  app.listen(PORT, () => console.log(`Lumanara backend (Node) listening on ${PORT}`));
}

start().catch(err => { console.error(err); process.exit(1); });
