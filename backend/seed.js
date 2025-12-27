const mongoose = require('mongoose');
const Category = require('./models/Category');
const Account = require('./models/Account');
const Transaction = require('./models/Transaction');
const LedgerService = require('./services/ledgerService');

// 1. HARDCODE THE URI TEMPORARILY
// Replace this with your actual MongoDB string from your Atlas dashboard
const URI = "mongodb+srv://cosmosjay21_db_user:x6MDW5Kfpjd2ks8l@cluster0.lcj99yy.mongodb.net/?appName=Cluster0";

const USER_ID = "694d74a7f580679937b8c50e"; 

async function runSeed() {
    try {
        console.log("🚀 Starting Seed Process...");
        await mongoose.connect(URI);
        console.log("✅ Connected to MongoDB");

        // CLEANUP
        console.log("🧹 Wiping old data...");
        await Category.deleteMany({ user: USER_ID });
        await Account.deleteMany({ user: USER_ID });
        await Transaction.deleteMany({ user: USER_ID });

        // CATEGORIES
        console.log("📂 Creating Categories...");
        const cats = await Category.insertMany([
            { name: 'Salary', type: 'INCOME', icon: 'cash', color: '#4CAF50', user: USER_ID },
            { name: 'Food', type: 'EXPENSE', icon: 'restaurant', color: '#FF5722', user: USER_ID },
            { name: 'Rent', type: 'EXPENSE', icon: 'home', color: '#2196F3', user: USER_ID }
        ]);

        // ACCOUNTS
        console.log("🏦 Creating Accounts...");
        const gtBank = await Account.create({
            name: 'GTBank Savings',
            type: 'ASSET',
            subType: 'BANK',
            balance: 0, 
            user: USER_ID
        });

        // TRANSACTIONS (Using LedgerService to handle the math)
        console.log("💰 Recording Initial Income...");
        const income = 50000000; // 500k Naira (in Kobo)
        await Transaction.create({
            user: USER_ID, type: 'INCOME', amount: income, account: gtBank._id,
            category: cats[0]._id, description: 'Opening Balance', date: new Date()
        });
        await LedgerService.recordIncome(gtBank._id, income);

        console.log("💸 Recording Grocery Expense...");
        const expense = 2500000; // 25k Naira (in Kobo)
        await Transaction.create({
            user: USER_ID, type: 'EXPENSE', amount: expense, account: gtBank._id,
            category: cats[1]._id, description: 'Grocery shopping', date: new Date()
        });
        await LedgerService.recordExpense(gtBank._id, expense);

        console.log(`
        ------------------------------------
        ✨ SEEDING SUCCESSFUL!
        GTBank Final Balance: ₦${(income - expense) / 100}
        ------------------------------------
        `);
        
        process.exit(0);
    } catch (err) {
        console.error("❌ SEED FAILED:", err.message);
        process.exit(1);
    }
}

runSeed();