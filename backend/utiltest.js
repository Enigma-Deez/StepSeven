const mongoose = require('mongoose');
const dotenv = require('dotenv');
const LedgerService = require('./services/ledgerService');

// 1. Load your .env file so we have the MONGO_URI
dotenv.config();

const runLedgerTests = async () => {
  try {
    // 2. Connect to the Database
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected!');

    const userId = "6950c1f000b053eb9699f497"; 
    
    // 3. Get a real Account ID from the database first
    // This ensures we aren't testing with a fake/wrong ID
    const Account = require('./models/Account');
    const account = await Account.findOne({ user: userId });

    if (!account) {
      console.log('❌ No account found for this user. Create one first!');
      return;
    }

    const accountId = account._id;

    console.log('--- 📊 LedgerService Test Suite ---');

    const netWorth = await LedgerService.calculateNetWorth(userId);
    console.log(`💰 Net Worth: ${netWorth} kobo`);

    const balance = await LedgerService.getBalance(accountId);
    console.log(`🏦 Account Balance: ${balance} kobo`);

  } catch (error) {
    console.error('❌ Ledger Test Error:', error.message);
  } finally {
    // 4. Close connection so the script exits
    await mongoose.connection.close();
    process.exit();
  }
};

runLedgerTests();