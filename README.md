# 🚀 StepSeven

**Nigerian Financial Command Center (budgeting and finance tracking) with Dave Ramsey's Baby Steps Built In.**

StepSeven is a full-stack, multi-user money management application inspired by the "Money Manager" app, designed specifically for Nigerian users with Dave Ramsey's Baby Steps methodology integrated at its core.

---

## ✨ Key Features

### 💰 Core Financial Management
- **Double-Entry Bookkeeping**: Every transaction maintains ledger integrity
- **Account Types**: Assets (Cash, Bank), Liabilities (Credit Cards, Loans), Equity
- **Transaction Integrity**: MongoDB Sessions ensure atomic transfers
- **Money Handling**: Integer-based arithmetic (kobo) prevents floating-point errors
- **Multi-Currency Support**: Default NGN (₦) with support for USD, EUR, GBP

### 📊 Baby Steps Integration
- **Step 1**: Starter Emergency Fund (₦1,000)
- **Step 2**: Debt Snowball Visualizer with smallest-to-largest tracking
- **Step 3**: Full Emergency Fund (3-6 months expenses, auto-calculated)
- **Steps 4-7**: Investing, education, home payoff, wealth building
- **Gazelle Intensity Widget**: Shows unallocated cash to throw at debt
- **Sinking Funds**: Track multiple savings goals within accounts

### 🎯 Advanced Features
- **Budgets**: Monthly/Weekly with carry-over logic
- **Analytics**: Expenses by category, monthly cash flow, net worth tracking
- **Credit Card Logic**: Billing cycles and settlement dates
- **Pagination**: Efficient loading of 50 transactions at a time
- **Search & Filter**: Find transactions quickly
- **Hierarchical Categories**: Parent-child category structure

---

## 🏗️ Architecture

### Backend Stack
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB 6+ with Mongoose
- **Authentication**: JWT with HTTP-only cookies
- **Security**: Helmet, Rate Limiting, NoSQL Injection Prevention

### Frontend Stack
- **Library**: React 18+
- **Routing**: React Router v6
- **State Management**: Context API
- **Charts**: Recharts
- **Styling**: Pure CSS (no frameworks)
- **HTTP Client**: Axios with interceptors

---

## 🚀 Quick Start

### Prerequisites
```bash
- Node.js 18+
- MongoDB 6+
- npm or yarn
```

### Backend Setup

1. **Clone and Install**
```bash
git clone <repository-url>
cd stepseven-backend
npm install
```

2. **Environment Configuration**
```bash
cp .env.example .env
```

Edit `.env`:
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/stepseven
JWT_SECRET=your_super_secret_jwt_key_here_min_32_chars
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000
```

3. **Start MongoDB**
```bash
# macOS/Linux
mongod --dbpath=/path/to/data

# Windows
mongod --dbpath C:\data\db
```

4. **Run Backend**
```bash
npm run dev  # Development with nodemon
npm start    # Production
```

Backend will run on `http://localhost:5000`

### Frontend Setup

1. **Install Dependencies**
```bash
cd stepseven-frontend
npm install
```

2. **Environment Configuration**
```bash
# Create .env file
REACT_APP_API_URL=http://localhost:5000/api
```

3. **Run Frontend**
```bash
npm start
```

Frontend will run on `http://localhost:3000`

---

## 📁 Project Structure

### Backend
```
stepseven-backend/
├── server.js              # Entry point
├── config/                # Database, JWT config
├── middleware/            # Auth, error handling
├── models/                # Mongoose schemas
├── controllers/           # Request handlers
├── services/              # Business logic (ledger, baby steps)
├── routes/                # API routes
└── utils/                 # Helpers (dates, money)
```

### Frontend
```
stepseven-frontend/
├── src/
│   ├── api/              # Axios API calls
│   ├── context/          # Global state
│   ├── hooks/            # Custom hooks
│   ├── components/       # React components
│   ├── pages/            # Page components
│   └── utils/            # Frontend utilities
```

---

## 🔐 Security Features

### Authentication
- JWT tokens stored in HTTP-only cookies
- Password hashing with bcrypt (12 rounds)
- Token expiration and refresh logic
- Protected routes with `checkAuth` middleware

### Authorization
- **IDOR Prevention**: Every query scoped to `req.user.id`
- Users can only access their own data
- No direct balance updates (transactions only)

### Data Validation
- Mongoose schema validation
- Request sanitization (express-mongo-sanitize)
- Rate limiting (100 requests per 15 minutes)
- Helmet security headers

---

## 💾 Database Schema

### User
```javascript
{
  email: String (unique),
  password: String (hashed),
  firstName: String,
  lastName: String,
  currency: {
    code: 'NGN',
    symbol: '₦',
    subunitName: 'kobo',
    subunitToUnit: 100
  }
}
```

### Account
```javascript
{
  user: ObjectId,
  name: String,
  type: 'ASSET' | 'LIABILITY' | 'EQUITY',
  subType: 'CASH' | 'BANK' | 'CREDIT_CARD' | 'LOAN',
  balance: Number (in kobo),
  includeInTotal: Boolean,
  creditCardDetails: { ... },
  loanDetails: { ... }
}
```

### Transaction
```javascript
{
  user: ObjectId,
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER',
  amount: Number (in kobo),
  account: ObjectId,          // For INCOME/EXPENSE
  category: ObjectId,          // For INCOME/EXPENSE
  fromAccount: ObjectId,       // For TRANSFER
  toAccount: ObjectId,         // For TRANSFER
  date: String (ISO 8601),
  description: String
}
```

### Progress (Baby Steps)
```javascript
{
  user: ObjectId,
  currentStep: Number (1-7),
  step1: {
    targetAmount: 100000,      // ₦1,000 in kobo
    currentAmount: Number,
    completed: Boolean
  },
  step2: {
    debts: [{
      name, balance, order
    }],
    completed: Boolean
  },
  step3: {
    targetAmount: Number,      // Auto-calculated
    monthsOfExpenses: 6,
    completed: Boolean
  }
}
```

---

## 🔄 Critical Financial Logic

### Double-Entry Bookkeeping

**Income Transaction**
```
Debit:  Asset Account (increases)
Credit: Income (implicit)
```

**Expense Transaction**
```
Debit:  Expense (implicit)
Credit: Asset Account (decreases)
```

**Transfer Between Accounts**
```
Debit:  Destination Account
Credit: Source Account
```

### Update Transaction Logic
When updating a transaction:
1. **Reverse** the old transaction's effect on balances
2. Apply the updates to the transaction record
3. **Apply** the new transaction's effect on balances

This ensures balance integrity even when amount, account, or type changes.

### Atomic Transfers
All transfers use MongoDB Sessions:
```javascript
const session = await mongoose.startSession();
session.startTransaction();
try {
  // Deduct from source
  // Add to destination
  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
}
```

---

## 📊 API Endpoints

### Authentication
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
```

### Transactions
```
GET    /api/transactions?page=1&limit=50
GET    /api/transactions/:id
POST   /api/transactions
PUT    /api/transactions/:id
DELETE /api/transactions/:id
```

### Transfers
```
POST   /api/transactions/transfer
PUT    /api/transactions/transfer/:id
DELETE /api/transactions/transfer/:id
```

### Baby Steps
```
GET    /api/babysteps/progress
POST   /api/babysteps/recalculate
PUT    /api/babysteps/targets
GET    /api/babysteps/gazelle-intensity
GET    /api/babysteps/smallest-debt
```

### Analytics
```
GET    /api/analytics/expenses-by-category
GET    /api/analytics/monthly-cashflow
GET    /api/analytics/net-worth
GET    /api/analytics/spending-trends
GET    /api/analytics/budget-comparison
```

---

## 🎨 Frontend Components

### Key React Components
- `BabyStepDashboard`: Main Baby Steps view
- `SnowballVisualizer`: Debt snowball chart (Recharts)
- `GazelleIntensityWidget`: Unallocated cash alert
- `TransactionForm`: Fast 3-click transaction entry
- `TransactionList`: Paginated list with filters
- `ExpensesByCategory`: Pie chart visualization
- `MonthlyCashFlow`: Bar chart (income vs expenses)

### Context Providers
- `AuthContext`: User authentication state
- `AccountContext`: Global account balances
- `CurrencyContext`: Multi-currency formatting

---

## 🚢 Deployment

### Backend Deployment (Heroku Example)

1. **Install Heroku CLI**
```bash
npm install -g heroku
```

2. **Login and Create App**
```bash
heroku login
heroku create stepseven-api
```

3. **Set Environment Variables**
```bash
heroku config:set NODE_ENV=production
heroku config:set MONGO_URI=<your-mongodb-atlas-uri>
heroku config:set JWT_SECRET=<your-secret>
heroku config:set CLIENT_URL=<your-frontend-url>
```

4. **Deploy**
```bash
git push heroku main
```

### Frontend Deployment (Vercel Example)

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Deploy**
```bash
cd stepseven-frontend
vercel --prod
```

3. **Set Environment Variables**
In Vercel dashboard, add:
```
REACT_APP_API_URL=https://stepseven-api.herokuapp.com/api
```

### MongoDB Atlas Setup
1. Create cluster at https://cloud.mongodb.com
2. Whitelist all IPs (0.0.0.0/0) for production
3. Create database user
4. Get connection string

---

## 🧪 Testing

### Backend Tests
```bash
cd stepseven-backend
npm test              # Run all tests
npm run test:coverage # Coverage report
```

### Frontend Tests
```bash
cd stepseven-frontend
npm test
```

---

## 🎯 Dave Ramsey Integration

### Baby Step Calculation
The `BabyStepService` automatically:
1. Calculates current emergency fund balance
2. Sorts debts smallest to largest (Debt Snowball)
3. Auto-calculates 3-6 month expense target
4. Tracks progress through all 7 steps

### Gazelle Intensity
Shows monthly unallocated cash:
```
Unallocated = Income - Expenses
```
If positive, prompts user to "throw it at debt!"

### Sinking Funds
Sub-documents within accounts for targeted savings:
- Car Insurance
- School Fees
- Christmas Fund
- Etc.

---

## 🌍 Nigerian-Specific Features

### Currency Handling
- Default: Nigerian Naira (₦)
- Stored as kobo (100 kobo = ₦1)
- Supports currency switching

### Fast Manual Entry
Since no Nigerian bank API integration exists:
- 3-click transaction entry
- Quick account selection
- Category shortcuts
- Mobile-optimized

---

## 🔮 Future Enhancements

### Phase 2
- [ ] Recurring transactions automation
- [ ] Bill reminders
- [ ] Receipt upload (OCR)
- [ ] Multiple device sync

### Phase 3
- [ ] Shared budgets (family accounts)
- [ ] Goal tracking (vacations, purchases)
- [ ] Investment portfolio tracking
- [ ] Tax estimation

### Phase 4
- [ ] Bank statement import (CSV)
- [ ] Nigerian bank API integration (if available)
- [ ] Mobile apps (React Native)
- [ ] AI-powered insights

---

## 📝 License

MIT License - See LICENSE file

---

## 👥 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 💬 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Email: support@stepseven.app

---

## 🙏 Acknowledgments

- Inspired by Money Manager (Realbyte Inc.)
- Dave Ramsey's Baby Steps methodology
- Nigerian FinTech community

---

**Built with ❤️ for financial freedom in Nigeria**