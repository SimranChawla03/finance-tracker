# 💰 FinanceTracker

A personal finance tracking web application to manage income, expenses, and visualize spending habits with beautiful charts.

🌐 **Live Demo:** [https://finance-tracker-3ok4.onrender.com](https://finance-tracker-3ok4.onrender.com)

---

## ✨ Features

- 🔐 **User Authentication** — Secure signup and login with personal accounts
- ➕ **Transaction Management** — Add and delete income/expense transactions instantly
- 📊 **Analytics Dashboard** — Line chart, donut chart, and bar chart visualizations
- 💹 **Real-time Stats** — Live income, expense, and net balance calculations
- 🎨 **Modern Dark UI** — Clean minimal design with smooth animations
- 📱 **Responsive** — Works on desktop and mobile

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, JavaScript |
| Backend | Node.js, Express.js |
| Database | JSON file (finance.db.json) |
| Charts | Chart.js |
| Hosting | Render.com |
| Fonts | Google Fonts (Syne + DM Sans) |

---

## 📁 Project Structure

```
FINANCE-TRACKER-PROJECT/
├── public/
│   ├── css/
│   │   └── style.css        # All styles
│   ├── js/
│   │   └── script.js        # Frontend logic
│   ├── index.html           # Landing page
│   ├── login.html           # Login page
│   ├── signup.html          # Signup page
│   └── dashboard.html       # Main dashboard
├── server.js                # Express backend
├── package.json             # Dependencies
└── finance.db.json          # Database (auto-created)
```

---

## 🚀 Run Locally

**Prerequisites:** Node.js installed

```bash
# Clone the repo
git clone https://github.com/SimranChawla03/finance-tracker.git
cd finance-tracker

# Install dependencies
npm install

# Start the server
node server.js

# Open in browser
# Go to http://localhost:3000
```

---

## 📸 Screenshots

### Landing Page
Clean hero section with animated dashboard preview card

### Login / Signup
Split-screen auth layout with form validation

### Dashboard
- Add transactions with description, amount, and type
- View income/expense/balance stat cards
- Monthly trend line chart
- Recent transactions list with filters

### Analytics
- Income vs Expense donut chart
- Top transactions bar chart
- Activity summary with progress bars

---

## 👩‍💻 Developer

**Simran Chawla**
- GitHub: [@SimranChawla03](https://github.com/SimranChawla03)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).