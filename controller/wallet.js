const Wallet = require('../models/Wallet');
const mongoose = require('mongoose');

//  Get wallet data
exports.getWallet = async (req, res) => {
  try {
    let wallet = await Wallet.findOne({ userId: req.params.userId });

    // If wallet doesn't exist, create one automatically
    if (!wallet) {
      wallet = new Wallet({
        userId: req.params.userId,
        balance: 0,
        transactions: []
      });
      await wallet.save();
    } else {
      // Heal logic: Recalculate balance from history if they don't match (prevents sync issues)
      const calculatedBalance = wallet.transactions.reduce((acc, t) => {
        return t.type === 'credit' || t.type === 'Credit' ? acc + t.amount : acc - t.amount;
      }, 0);

      if (Math.abs(wallet.balance - calculatedBalance) > 0.01) {
        console.log(`🔧 Healing Wallet Balance for user ${req.params.userId}: ${wallet.balance} -> ${calculatedBalance}`);
        wallet.balance = calculatedBalance;
        await wallet.save();
      }
    }

    res.json(wallet);
  } catch (err) {
    console.error('Get Wallet Error:', err);
    res.status(500).json({ message: err.message });
  }
};

//  Add transaction and update balance (Atomic)
exports.addTransaction = async (req, res) => {
  try {
    const { userId, type, amount, description } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const objectUserId = new mongoose.Types.ObjectId(userId);
    const numAmount = parseFloat(amount);

    // Initial check for debit
    if (type === 'debit') {
      const existingWallet = await Wallet.findOne({ userId: objectUserId });
      if (existingWallet && existingWallet.balance < numAmount) {
        return res.status(400).json({ message: 'Insufficient balance' });
      }
    }

    // Use findOneAndUpdate for atomic safety
    const updatedWallet = await Wallet.findOneAndUpdate(
      { userId: objectUserId },
      {
        $inc: { balance: type === 'credit' ? numAmount : -numAmount },
        $push: {
          transactions: {
            type: type.toLowerCase(),
            amount: numAmount,
            description: description || 'Balance Update',
            date: new Date()
          }
        }
      },
      { new: true, upsert: true }
    );

    // Sync with Global Transactions
    try {
      const Transaction = require('../models/Transaction');
      const User = require('../models/User');
      const { v4: uuidv4 } = require('uuid');

      const user = await User.findById(objectUserId).select('fullName email');
      const customerName = user ? (user.fullName || user.email) : 'Unknown User';

      await Transaction.create({
        txnId: "TXN-WALLET-" + uuidv4().slice(0, 8).toUpperCase(),
        customer: customerName,
        userId: objectUserId,
        type: type === 'credit' ? 'Credit' : 'Debit',
        amount: numAmount,
        method: 'Wallet',
        status: 'Completed',
        orderId: description || 'Wallet Adjustment',
        date: new Date()
      });
      console.log(`Global transaction record created for wallet ${type}`);
    } catch (glErr) {
      console.error("Failed to sync global transaction:", glErr);
    }

    res.status(201).json(updatedWallet);
  } catch (err) {
    console.error('Add Transaction Error:', err);
    res.status(500).json({ message: err.message });
  }
};
