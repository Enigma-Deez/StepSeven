class TransferController {
  /**
   * Create a transfer between two accounts
   */
  static async createTransfer(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { amount, fromAccount, toAccount, date, description, notes } = req.body;
      const userId = req.user.id;

      // Validate both accounts belong to user
      const [sourceAccount, destinationAccount] = await Promise.all([
        Account.findOne({ _id: fromAccount, user: userId }).session(session),
        Account.findOne({ _id: toAccount, user: userId }).session(session)
      ]);

      if (!sourceAccount || !destinationAccount) {
        throw new Error('One or both accounts not found or unauthorized');
      }

      if (fromAccount === toAccount) {
        throw new Error('Cannot transfer to the same account');
      }

      // Check sufficient balance in source account
      if (sourceAccount.type === 'ASSET' && sourceAccount.balance < parseInt(amount)) {
        throw new Error('Insufficient balance in source account');
      }

      // Create transfer transaction
      const transfer = new Transaction({
        user: userId,
        type: 'TRANSFER',
        amount: parseInt(amount),
        fromAccount,
        toAccount,
        date: date || new Date().toISOString(),
        description,
        notes
      });

      await transfer.save({ session });

      // Execute transfer via ledger
      await LedgerService.recordTransfer(fromAccount, toAccount, transfer.amount, session);

      await session.commitTransaction();

      // Populate for response
      await transfer.populate(['fromAccount', 'toAccount']);

      res.status(201).json({
        success: true,
        data: transfer
      });
    } catch (error) {
      await session.abortTransaction();
      res.status(400).json({
        success: false,
        message: error.message
      });
    } finally {
      session.endSession();
    }
  }

  /**
   * Update a transfer
   */
  static async updateTransfer(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { id } = req.params;
      const userId = req.user.id;
      const updates = req.body;

      // Find existing transfer
      const existingTransfer = await Transaction.findOne({
        _id: id,
        user: userId,
        type: 'TRANSFER'
      }).session(session);

      if (!existingTransfer) {
        throw new Error('Transfer not found or unauthorized');
      }

      // Reverse the old transfer
      await LedgerService.reverseTransaction(existingTransfer, session);

      // Validate new accounts if changed
      if (updates.fromAccount || updates.toAccount) {
        const fromAccountId = updates.fromAccount || existingTransfer.fromAccount;
        const toAccountId = updates.toAccount || existingTransfer.toAccount;

        if (fromAccountId.toString() === toAccountId.toString()) {
          throw new Error('Cannot transfer to the same account');
        }

        const [sourceAccount, destinationAccount] = await Promise.all([
          Account.findOne({ _id: fromAccountId, user: userId }).session(session),
          Account.findOne({ _id: toAccountId, user: userId }).session(session)
        ]);

        if (!sourceAccount || !destinationAccount) {
          throw new Error('One or both new accounts not found or unauthorized');
        }
      }

      // Apply updates
      Object.keys(updates).forEach(key => {
        if (key === 'amount') {
          existingTransfer[key] = parseInt(updates[key]);
        } else {
          existingTransfer[key] = updates[key];
        }
      });

      await existingTransfer.save({ session });

      // Apply the new transfer
      await LedgerService.recordTransfer(
        existingTransfer.fromAccount,
        existingTransfer.toAccount,
        existingTransfer.amount,
        session
      );

      await session.commitTransaction();

      await existingTransfer.populate(['fromAccount', 'toAccount']);

      res.json({
        success: true,
        data: existingTransfer
      });
    } catch (error) {
      await session.abortTransaction();
      res.status(400).json({
        success: false,
        message: error.message
      });
    } finally {
      session.endSession();
    }
  }

  /**
   * Delete a transfer
   */
  static async deleteTransfer(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { id } = req.params;
      const userId = req.user.id;

      const transfer = await Transaction.findOne({
        _id: id,
        user: userId,
        type: 'TRANSFER'
      }).session(session);

      if (!transfer) {
        throw new Error('Transfer not found or unauthorized');
      }

      // Reverse the transfer
      await LedgerService.reverseTransaction(transfer, session);

      // Delete the transfer
      await Transaction.deleteOne({ _id: id }).session(session);

      await session.commitTransaction();

      res.json({
        success: true,
        message: 'Transfer deleted successfully'
      });
    } catch (error) {
      await session.abortTransaction();
      res.status(400).json({
        success: false,
        message: error.message
      });
    } finally {
      session.endSession();
    }
  }
}

module.exports = TransferController;