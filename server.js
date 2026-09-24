/* ===========================================
   FinanceTracker — Server
   Database: sql.js (pure JavaScript, no compilation needed!)
   =========================================== */

const express    = require('express');
const bodyParser = require('body-parser');
const cors       = require('cors');
const path       = require('path');
const fs         = require('fs');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

/* ============================================
   DATABASE SETUP (sql.js — pure JS, no build needed)
============================================ */

const DB_FILE = path.join(__dirname, 'finance.db.json');

// Simple JSON-based database — no native modules needed at all!
// Stores everything in a JSON file on disk.

function loadDB() {
  if (fs.existsSync(DB_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    } catch(e) {
      // corrupted, start fresh
    }
  }
  return { users: [], transactions: [], nextUserId: 1, nextTxnId: 1 };
}

function saveDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// Initialize DB
let db = loadDB();
console.log('✅ Database ready (finance.db.json)');

/* ============================================
   ROUTES
============================================ */

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running ✅' });
});

/* ---- SIGNUP ---- */
app.post('/signup', (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password)
    return res.json({ success: false, message: 'All fields are required.' });
  if (password.length < 6)
    return res.json({ success: false, message: 'Password must be at least 6 characters.' });

  db = loadDB();

  const existing = db.users.find(u => u.email === email);
  if (existing)
    return res.json({ success: false, message: 'Email already registered.' });

  db.users.push({
    id: db.nextUserId++,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password
  });
  saveDB(db);

  res.json({ success: true });
});

/* ---- LOGIN ---- */
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.json({ success: false, message: 'All fields are required.' });

  db = loadDB();

  const user = db.users.find(
    u => u.email === email.trim().toLowerCase() && u.password === password
  );

  if (user) {
    res.json({ success: true, name: user.name });
  } else {
    res.json({ success: false, message: 'Invalid email or password.' });
  }
});

/* ---- ADD TRANSACTION ---- */
app.post('/addTransaction', (req, res) => {
  const { email, description, amount, type } = req.body;

  if (!email || !description || !amount || !type)
    return res.json({ success: false, message: 'All fields are required.' });
  if (!['income', 'expense'].includes(type))
    return res.json({ success: false, message: 'Invalid transaction type.' });

  db = loadDB();

  const now = new Date();
  const created_at = now.toLocaleString('en-IN', { 
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  db.transactions.push({
    id: db.nextTxnId++,
    user_email: email.trim().toLowerCase(),
    description: description.trim(),
    amount: parseFloat(amount),
    type,
    created_at
  });
  saveDB(db);

  res.json({ success: true });
});

/* ---- GET TRANSACTIONS ---- */
app.post('/getTransactions', (req, res) => {
  const { email } = req.body;
  if (!email) return res.json([]);

  db = loadDB();

  const rows = db.transactions
    .filter(t => t.user_email === email.trim().toLowerCase())
    .map(t => [t.description, t.amount, t.type, t.created_at, t.id]);

  res.json(rows);
});

/* ---- DELETE TRANSACTION ---- */
app.post('/deleteTransaction', (req, res) => {
  const { id, email } = req.body;
  if (!id || !email) return res.json({ success: false, message: 'Missing data.' });

  db = loadDB();
  const before = db.transactions.length;
  db.transactions = db.transactions.filter(
    t => !(t.id === parseInt(id) && t.user_email === email.trim().toLowerCase())
  );

  if (db.transactions.length < before) {
    saveDB(db);
    res.json({ success: true });
  } else {
    res.json({ success: false, message: 'Transaction not found.' });
  }
});

/* ============================================
   START
============================================ */
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`\n🚀  FinanceTracker running at → http://localhost:${PORT}`);
  console.log('    Open that URL in your browser!\n');
  console.log('    (Your data is saved in finance.db.json)\n');
});