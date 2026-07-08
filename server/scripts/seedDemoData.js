const path = require('path');
const fs = require('fs');
const Entry = require('../models/Entries');
const Budget = require('../models/Budgets');

function shiftDatesForward(entries) {
  const dates = entries.map((e) => new Date(e.date));
  const newest = new Date(Math.max(...dates));
  const today = new Date();
  const shiftMs = today - newest;

  return entries.map((entry) => ({
    ...entry,
    date: new Date(new Date(entry.date).getTime() + shiftMs),
  }));
}

function computeBudgetsFromEntries(entries) {
  const buckets = {};

  entries.forEach((e) => {
    if (e.type === 'income') return;
    const key = `${e.type}::${e.category}`;
    if (!buckets[key]) {
      buckets[key] = { type: e.type, category: e.category, months: {} };
    }
    const monthKey =
      e.date.getFullYear() + '-' + String(e.date.getMonth() + 1).padStart(2, '0');
    buckets[key].months[monthKey] =
      (buckets[key].months[monthKey] || 0) + e.amount;
  });

  const budgets = [];

  Object.values(buckets).forEach((b) => {
    const monthCount = Object.keys(b.months).length;
    if (monthCount < 2) return;

    const total = Object.values(b.months).reduce((a, v) => a + v, 0);
    const avg = Math.round(total / monthCount);
    const budgetAmount = Math.round((avg * 1.15) / 500) * 500;

    budgets.push({
      type: b.type,
      category: b.category,
      amount: Math.max(budgetAmount, 500),
      period: 'monthly',
    });
  });

  return budgets;
}

async function seedDemoData(userId) {
  const entriesPath = path.join(
    __dirname,
    '../../client/src/json/generated-entries.json'
  );

  if (!fs.existsSync(entriesPath)) {
    console.error('Demo entries file not found, skipping seed');
    return;
  }

  const rawEntries = JSON.parse(fs.readFileSync(entriesPath, 'utf-8'));
  const shifted = shiftDatesForward(rawEntries);

  const entriesToInsert = shifted.map((entry) => ({
    userId,
    type: entry.type,
    category: entry.category,
    amount: entry.amount,
    date: entry.date,
    description: entry.description || '',
  }));

  const batchSize = 1000;
  for (let i = 0; i < entriesToInsert.length; i += batchSize) {
    await Entry.insertMany(entriesToInsert.slice(i, i + batchSize), {
      ordered: false,
    });
  }

  const budgets = computeBudgetsFromEntries(shifted).map((b) => ({
    ...b,
    userId,
  }));

  await Budget.insertMany(budgets);
}

module.exports = seedDemoData;