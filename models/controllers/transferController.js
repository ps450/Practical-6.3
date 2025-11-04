const Account = require("../models/Account");

exports.transferMoney = async (req, res) => {
  const { senderEmail, receiverEmail, amount } = req.body;

  // Validate inputs
  if (!senderEmail || !receiverEmail || !amount) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  if (amount <= 0) {
    return res.status(400).json({ message: "Transfer amount must be positive" });
  }

  try {
    // Fetch both accounts
    const sender = await Account.findOne({ email: senderEmail });
    const receiver = await Account.findOne({ email: receiverEmail });

    // Validate accounts
    if (!sender) return res.status(404).json({ message: "Sender account not found" });
    if (!receiver) return res.status(404).json({ message: "Receiver account not found" });

    // Check balance
    if (sender.balance < amount) {
      return res.status(400).json({ message: "Insufficient balance in sender account" });
    }

    // Sequential update (no DB transaction)
    sender.balance -= amount;
    receiver.balance += amount;

    // Save both updates
    await sender.save();
    await receiver.save();

    res.status(200).json({
      message: `Transfer of ₹${amount} from ${sender.name} to ${receiver.name} successful`,
      senderBalance: sender.balance,
      receiverBalance: receiver.balance
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
