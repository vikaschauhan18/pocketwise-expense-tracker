import { Router } from 'express';
import mongoose from 'mongoose';
import Transaction from '../models/Transaction.js';
import auth from '../middleware/auth.js';
const router = Router();
router.use(auth);
const clean = body => ({
  type: body.type, amount: Number(body.amount), category: String(body.category || '').trim(),
  description: String(body.description || '').trim(), date: body.date ? new Date(body.date) : new Date()
});
function validate(data) {
  return ['income', 'expense'].includes(data.type) && Number.isFinite(data.amount) && data.amount > 0 &&
    data.category.length > 0 && data.category.length <= 60 && !Number.isNaN(data.date.getTime());
}
router.get('/', async (req, res, next) => {
  try {
    const q = { user: req.userId };
    if (['income', 'expense'].includes(req.query.type)) q.type = req.query.type;
    if (req.query.category) q.category = String(req.query.category);
    if (req.query.from || req.query.to) {
      q.date = {};
      if (req.query.from) q.date.$gte = new Date(req.query.from);
      if (req.query.to) { const to = new Date(req.query.to); to.setHours(23,59,59,999); q.date.$lte = to; }
    }
    const items = await Transaction.find(q).sort({ date: -1, createdAt: -1 }).limit(1000);
    res.json({ transactions: items });
  } catch (err) { next(err); }
});
router.get('/summary', async (req, res, next) => {
  try {
    const month = /^\d{4}-\d{2}$/.test(req.query.month || '') ? req.query.month : new Date().toISOString().slice(0,7);
    const start = new Date(`${month}-01T00:00:00.000Z`);
    const end = new Date(start); end.setUTCMonth(end.getUTCMonth() + 1);
    const rows = await Transaction.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(req.userId), date: { $gte: start, $lt: end } } },
      { $group: { _id: { type: '$type', category: '$category' }, total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);
    let income = 0, expenses = 0; const categories = [];
    for (const r of rows) {
      if (r._id.type === 'income') income += r.total; else { expenses += r.total; categories.push({ category: r._id.category, amount: r.total }); }
    }
    res.json({ month, income, expenses, balance: income - expenses, categories: categories.sort((a,b) => b.amount-a.amount) });
  } catch (err) { next(err); }
});
router.post('/', async (req, res, next) => {
  try {
    const data = clean(req.body);
    if (!validate(data)) return res.status(400).json({ message: 'Valid type, positive amount, category, and date are required.' });
    const transaction = await Transaction.create({ ...data, user: req.userId });
    res.status(201).json({ transaction });
  } catch (err) { next(err); }
});
router.put('/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid transaction id' });
    const data = clean(req.body);
    if (!validate(data)) return res.status(400).json({ message: 'Valid type, positive amount, category, and date are required.' });
    const transaction = await Transaction.findOneAndUpdate({ _id: req.params.id, user: req.userId }, data, { new: true, runValidators: true });
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    res.json({ transaction });
  } catch (err) { next(err); }
});
router.delete('/:id', async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid transaction id' });
    const transaction = await Transaction.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    res.json({ message: 'Transaction deleted' });
  } catch (err) { next(err); }
});
export default router;
