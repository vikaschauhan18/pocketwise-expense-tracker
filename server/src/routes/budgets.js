import { Router } from 'express';
import mongoose from 'mongoose';
import Budget from '../models/Budget.js';
import Transaction from '../models/Transaction.js';
import auth from '../middleware/auth.js';
const router = Router();
router.use(auth);
const validMonth = m => /^\d{4}-\d{2}$/.test(m || '');
router.get('/', async (req, res, next) => {
  try {
    const month = validMonth(req.query.month) ? req.query.month : new Date().toISOString().slice(0,7);
    const start = new Date(`${month}-01T00:00:00.000Z`); const end = new Date(start); end.setUTCMonth(end.getUTCMonth()+1);
    const [budgets, spent] = await Promise.all([
      Budget.find({ user: req.userId, month }).sort({ category: 1 }),
      Transaction.aggregate([
        { $match: { user: new mongoose.Types.ObjectId(req.userId), type: 'expense', date: { $gte: start, $lt: end } } },
        { $group: { _id: '$category', total: { $sum: '$amount' } } }
      ])
    ]);
    const map = new Map(spent.map(x => [x._id, x.total]));
    res.json({ month, budgets: budgets.map(b => ({ ...b.toObject(), spent: map.get(b.category) || 0, remaining: b.amount - (map.get(b.category) || 0) })) });
  } catch (err) { next(err); }
});
router.post('/', async (req, res, next) => {
  try {
    const month = String(req.body.month || '');
    const category = String(req.body.category || '').trim();
    const amount = Number(req.body.amount);
    if (!validMonth(month) || !category || !Number.isFinite(amount) || amount <= 0) return res.status(400).json({ message: 'Valid month, category and positive amount are required.' });
    const budget = await Budget.findOneAndUpdate(
      { user: req.userId, month, category }, { $set: { amount } }, { upsert: true, new: true, runValidators: true }
    );
    res.status(201).json({ budget });
  } catch (err) { next(err); }
});
router.delete('/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid budget id' });
    const budget = await Budget.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!budget) return res.status(404).json({ message: 'Budget not found' });
    res.json({ message: 'Budget deleted' });
  } catch (err) { next(err); }
});
export default router;
