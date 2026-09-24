/* ===========================================
   FinanceTracker — Complete Client Script
   =========================================== */

/* ---- UTILS ---- */

function formatCurrency(n) {
  return '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function formatDate(str) {
  if (!str) return '';
  const d = new Date(str);
  if (isNaN(d)) return str;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.querySelector('.toast-icon').textContent = type === 'success' ? '✅' : '❌';
  document.getElementById('toastMsg').textContent = message;
  toast.className = `toast ${type} show`;
  setTimeout(() => toast.classList.remove('show'), 3000);
}

function setDate() {
  const el = document.getElementById('currentDate');
  if (!el) return;
  el.textContent = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
}

function escapeHTML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/* ---- PASSWORD TOGGLE ---- */

function togglePassword(id) {
  const field = document.getElementById(id);
  if (!field) return;
  field.type = field.type === 'password' ? 'text' : 'password';
}

/* ---- AUTH: SIGNUP ---- */

function signupUser() {
  const name     = document.getElementById('name').value.trim();
  const email    = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const err      = document.getElementById('signupError');

  if (!name || !email || !password) { err.textContent = 'All fields are required.'; return; }
  if (password.length < 6)          { err.textContent = 'Password must be at least 6 characters.'; return; }
  err.textContent = '';

  fetch('/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  })
  .then(r => r.json())
  .then(data => {
    if (data.success) {
      window.location.href = 'login.html';
    } else {
      err.textContent = data.message || 'Signup failed.';
    }
  })
  .catch(() => { err.textContent = 'Cannot reach server. Make sure you ran: node server.js'; });
}

/* ---- AUTH: LOGIN ---- */

function loginUser() {
  const email    = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const err      = document.getElementById('loginError');

  if (!email || !password) { err.textContent = 'Please fill in all fields.'; return; }
  err.textContent = '';

  fetch('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  .then(r => r.json())
  .then(data => {
    if (data.success) {
      localStorage.setItem('username',  data.name);
      localStorage.setItem('userEmail', email);
      window.location.href = 'dashboard.html';
    } else {
      err.textContent = data.message || 'Invalid email or password.';
    }
  })
  .catch(() => { err.textContent = 'Cannot reach server. Make sure you ran: node server.js'; });
}

/* ---- AUTH GUARD ---- */

function checkAuth() {
  if (window.location.pathname.includes('dashboard') && !localStorage.getItem('userEmail')) {
    window.location.href = 'login.html';
  }
}

/* ---- LOGOUT ---- */

function logoutUser() {
  localStorage.removeItem('username');
  localStorage.removeItem('userEmail');
}

/* ---- LOAD USER INFO ---- */

function loadUser() {
  const name    = localStorage.getItem('username') || 'User';
  const nameEl  = document.getElementById('sidebarName');
  const avatarEl= document.getElementById('avatarInitial');
  if (nameEl)   nameEl.textContent   = name;
  if (avatarEl) avatarEl.textContent = name.charAt(0).toUpperCase();
}

/* ---- PAGE NAVIGATION ---- */

function showPage(page) {
  ['dashboard','transactions','analytics'].forEach(p => {
    const el = document.getElementById('page-' + p);
    if (el) el.style.display = (p === page) ? 'block' : 'none';
  });

  document.querySelectorAll('.nav-item').forEach(el => {
    const pages = ['dashboard','transactions','analytics'];
    const idx   = Array.from(document.querySelectorAll('.nav-item')).indexOf(el);
    el.classList.toggle('active', pages[idx] === page);
  });

  if (page === 'analytics')    renderAnalytics();
  if (page === 'transactions') renderAllTransactions();
}

/* ---- FILTERS ---- */

let currentFilter     = 'all';
let currentFilterPage = 'all';

function filterTxns(type, btn) {
  currentFilter = type;
  btn.closest('.txn-filter').querySelectorAll('.txn-filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderTransactionList();
}

function filterTxnsPage(type, btn) {
  currentFilterPage = type;
  btn.closest('.txn-filter').querySelectorAll('.txn-filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderAllTransactions();
}

/* ---- ADD TRANSACTION ---- */

function addTransaction() {
  const desc   = document.getElementById('desc').value.trim();
  const amount = parseFloat(document.getElementById('amount').value);
  const type   = document.getElementById('type').value;
  const email  = localStorage.getItem('userEmail');

  if (!desc)            { showToast('Please enter a description.', 'error'); return; }
  if (!amount || amount <= 0) { showToast('Please enter a valid amount.', 'error'); return; }

  fetch('/addTransaction', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, description: desc, amount, type })
  })
  .then(r => r.json())
  .then(data => {
    if (data.success) {
      document.getElementById('desc').value   = '';
      document.getElementById('amount').value = '';
      showToast('Transaction added!', 'success');
      loadTransactions();
    } else {
      showToast(data.message || 'Failed to add.', 'error');
    }
  })
  .catch(() => showToast('Server error.', 'error'));
}

/* ---- DELETE TRANSACTION ---- */

function deleteTransaction(id) {
  const email = localStorage.getItem('userEmail');
  if (!confirm('Delete this transaction?')) return;

  fetch('/deleteTransaction', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, email })
  })
  .then(r => r.json())
  .then(data => {
    if (data.success) {
      showToast('Transaction deleted.', 'success');
      loadTransactions();
    }
  })
  .catch(() => showToast('Delete failed.', 'error'));
}

/* ---- GLOBAL TRANSACTION STORE ---- */

let allTransactions = [];

/* ---- LOAD TRANSACTIONS FROM SERVER ---- */

function loadTransactions() {
  const email = localStorage.getItem('userEmail');
  if (!email) return;

  fetch('/getTransactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  })
  .then(r => r.json())
  .then(data => {
    // data rows: [description, amount, type, created_at, id]
    allTransactions = data.map(row => ({
      id:          row[4],
      description: row[0],
      amount:      parseFloat(row[1]),
      type:        row[2],
      date:        row[3]
    }));
    renderTransactionList();
    updateStats();
    renderLineChart();
  })
  .catch(err => console.error('Load error:', err));
}

/* ---- RENDER SIDEBAR TRANSACTION LIST ---- */

function renderTransactionList() {
  const list = document.getElementById('transactionList');
  if (!list) return;

  const filtered = currentFilter === 'all'
    ? allTransactions
    : allTransactions.filter(t => t.type === currentFilter);

  if (filtered.length === 0) {
    list.innerHTML = `<div class="empty-state">
      <div class="empty-icon">💸</div>
      <p>No transactions yet.<br>Add your first one!</p>
    </div>`;
    return;
  }

  list.innerHTML = [...filtered].reverse().slice(0, 15).map(t => txnItemHTML(t, false)).join('');
}

/* ---- RENDER ALL TRANSACTIONS PAGE ---- */

function renderAllTransactions() {
  const list = document.getElementById('allTransactionList');
  if (!list) return;

  const filtered = currentFilterPage === 'all'
    ? allTransactions
    : allTransactions.filter(t => t.type === currentFilterPage);

  if (filtered.length === 0) {
    list.innerHTML = `<div class="empty-state">
      <div class="empty-icon">💸</div>
      <p>No ${currentFilterPage === 'all' ? '' : currentFilterPage} transactions yet.</p>
    </div>`;
    return;
  }

  list.innerHTML = [...filtered].reverse().map(t => txnItemHTML(t, true)).join('');
}

/* ---- BUILD TRANSACTION LIST ITEM HTML ---- */

function txnItemHTML(t, showDelete) {
  const icon = t.type === 'income' ? '💚' : '🔴';
  const sign = t.type === 'income' ? '+' : '-';
  const deleteBtn = showDelete
    ? `<button class="txn-delete-btn" onclick="deleteTransaction(${t.id})" title="Delete">🗑</button>`
    : '';
  return `<li class="txn-item">
    <div class="txn-icon ${t.type}">${icon}</div>
    <div class="txn-info">
      <div class="txn-desc">${escapeHTML(t.description)}</div>
      <div class="txn-date">${formatDate(t.date)}</div>
    </div>
    <div class="txn-amount ${t.type}">${sign}${formatCurrency(t.amount)}</div>
    ${deleteBtn}
  </li>`;
}

/* ---- UPDATE STAT CARDS ---- */

function updateStats() {
  let income = 0, expense = 0;
  allTransactions.forEach(t => {
    if (t.type === 'income') income += t.amount;
    else                      expense += t.amount;
  });
  const balance = income - expense;

  ['statIncome','aStatIncome'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = formatCurrency(income);
  });
  ['statExpense','aStatExpense'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = formatCurrency(expense);
  });

  const balEl = document.getElementById('statBalance');
  if (balEl) balEl.textContent = formatCurrency(balance);

  const savEl = document.getElementById('aStatSavings');
  if (savEl) {
    const rate = income > 0 ? Math.round(((income - expense) / income) * 100) : 0;
    savEl.textContent = rate + '%';
  }
}

/* ---- LINE CHART ---- */

let lineChartInstance = null;

function renderLineChart() {
  const canvas = document.getElementById('lineChart');
  if (!canvas || typeof Chart === 'undefined') return;

  // Group into up to 7 buckets
  const n     = allTransactions.length;
  const chunk = Math.max(1, Math.ceil(n / 7));
  const incomeData = [], expenseData = [], labels = [];

  for (let i = 0; i < 7; i++) {
    const slice = allTransactions.slice(i * chunk, (i + 1) * chunk);
    incomeData.push( slice.filter(t => t.type === 'income').reduce((s,t) => s + t.amount, 0) );
    expenseData.push(slice.filter(t => t.type === 'expense').reduce((s,t) => s + t.amount, 0));
    labels.push('Period ' + (i + 1));
  }

  const cfg = {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Income',
          data: incomeData,
          borderColor: '#5ee7b7',
          backgroundColor: 'rgba(94,231,183,0.08)',
          borderWidth: 2, pointRadius: 4,
          pointBackgroundColor: '#5ee7b7',
          tension: 0.4, fill: true
        },
        {
          label: 'Expense',
          data: expenseData,
          borderColor: '#f76f6f',
          backgroundColor: 'rgba(247,111,111,0.08)',
          borderWidth: 2, pointRadius: 4,
          pointBackgroundColor: '#f76f6f',
          tension: 0.4, fill: true
        }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#7a7a9a', font: { size: 11 } } },
        y: {
          grid: { color: 'rgba(255,255,255,0.04)' },
          ticks: { color: '#7a7a9a', font: { size: 11 }, callback: v => '₹' + v.toLocaleString('en-IN') }
        }
      }
    }
  };

  if (lineChartInstance) lineChartInstance.destroy();
  lineChartInstance = new Chart(canvas, cfg);
}

/* ---- ANALYTICS CHARTS ---- */

let donutInstance = null;
let barInstance   = null;

function renderAnalytics() {
  updateStats();

  let income = 0, expense = 0;
  allTransactions.forEach(t => {
    if (t.type === 'income') income += t.amount;
    else                      expense += t.amount;
  });

  /* Donut */
  const donutCanvas = document.getElementById('donutChart');
  if (donutCanvas) {
    if (donutInstance) donutInstance.destroy();
    donutInstance = new Chart(donutCanvas, {
      type: 'doughnut',
      data: {
        labels: ['Income', 'Expense'],
        datasets: [{
          data: [income, expense],
          backgroundColor: ['rgba(94,231,183,0.8)','rgba(247,111,111,0.8)'],
          borderColor:     ['#5ee7b7','#f76f6f'],
          borderWidth: 2, hoverOffset: 6
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: '68%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: '#7a7a9a', font: { size: 12 }, padding: 16 }
          }
        }
      }
    });
  }

  /* Bar chart — top 7 by amount */
  const barCanvas = document.getElementById('barChart');
  if (barCanvas) {
    const top = [...allTransactions].sort((a,b) => b.amount - a.amount).slice(0,7);
    if (barInstance) barInstance.destroy();
    barInstance = new Chart(barCanvas, {
      type: 'bar',
      data: {
        labels: top.map(t => t.description.length > 10 ? t.description.slice(0,10)+'…' : t.description),
        datasets: [{
          label: 'Amount',
          data: top.map(t => t.amount),
          backgroundColor: top.map(t => t.type === 'income' ? 'rgba(94,231,183,0.7)' : 'rgba(247,111,111,0.7)'),
          borderColor:     top.map(t => t.type === 'income' ? '#5ee7b7' : '#f76f6f'),
          borderWidth: 1, borderRadius: 6
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#7a7a9a', font: { size: 11 } } },
          y: {
            grid: { color: 'rgba(255,255,255,0.04)' },
            ticks: { color: '#7a7a9a', font: { size: 11 }, callback: v => '₹' + v.toLocaleString('en-IN') }
          }
        }
      }
    });
  }

  /* Progress list */
  const listEl = document.getElementById('analyticsList');
  if (listEl) {
    if (allTransactions.length === 0) {
      listEl.innerHTML = '<div class="empty-state"><div class="empty-icon">📊</div><p>No data yet. Add transactions first.</p></div>';
      return;
    }
    const max = Math.max(...allTransactions.map(t => t.amount));
    listEl.innerHTML = [...allTransactions]
      .sort((a,b) => b.amount - a.amount)
      .slice(0,8)
      .map(t => {
        const pct   = Math.round((t.amount / max) * 100);
        const color = t.type === 'income' ? 'var(--income)' : 'var(--expense)';
        return `<li class="category-item">
          <div class="category-row">
            <span class="category-name">${escapeHTML(t.description)}</span>
            <span class="category-amount" style="color:${color}">${formatCurrency(t.amount)}</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" style="width:${pct}%;background:${color}"></div>
          </div>
        </li>`;
      }).join('');
  }
}

/* ---- INIT ---- */

document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  setDate();

  if (window.location.pathname.includes('dashboard')) {
    loadUser();
    loadTransactions();
  }
});