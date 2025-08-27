import {
  useBudgetStore,
  calculateBudgetProgress,
  Budget,
} from '@/store/budgetStore';
import { useCategoriesStore } from '@/store/categoriesStore';
import { useMemo, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Pie, PieChart, Cell } from 'recharts';

const periodOptions = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
];

const typeOptions = [
  { value: 'expense', label: 'Expense' },
  { value: 'savings', label: 'Savings' },
  { value: 'investment', label: 'Investment' },
];

const COLORS = {
  expense: '#FF4457',
  savings: '#FF9800',
  investment: '#2196F3',
};

function BudgetPieChart({ budget }: { budget: Budget }) {
  const { progress } = calculateBudgetProgress(budget);
  const color = COLORS[budget.type];
  const chartData = [
    { name: 'Used', value: progress, fill: color },
    { name: 'Remaining', value: 100 - progress, fill: '#e5e7eb' },
  ];
  return (
    <ChartContainer config={{}} className="w-24 h-24">
      <PieChart>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          innerRadius={32}
          outerRadius={48}
          startAngle={90}
          endAngle={-270}
          stroke="none"
        >
          {chartData.map((entry) => (
            <Cell key={entry.name} fill={entry.fill} />
          ))}
        </Pie>
        <ChartTooltip content={<ChartTooltipContent />} />
      </PieChart>
    </ChartContainer>
  );
}

function BudgetCard({
  budget,
  onRemove,
}: {
  budget: Budget;
  onRemove: (id: string) => void;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const removeBtnRef = useRef<HTMLButtonElement>(null);
  const { currentSpending, progress, remaining } =
    calculateBudgetProgress(budget);

  return (
    <div className="flex flex-col md:flex-row items-center gap-6 bg-card rounded-2xl p-6 border border-border shadow-md transition-all hover:shadow-lg">
      <div className="flex flex-col items-center gap-2">
        <BudgetPieChart budget={budget} />
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded bg-muted text-muted-foreground capitalize mt-2"
          style={{ background: `${COLORS[budget.type]}22` }}
        >
          {budget.type}
        </span>
      </div>
      <div className="flex-1 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-xl md:text-2xl">{budget.name}</span>
        </div>
        <div className="text-sm text-muted-foreground capitalize">
          <span className="font-semibold">{budget.category}</span> &middot;{' '}
          {budget.period}
        </div>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="font-mono text-lg font-bold text-primary">
            {currentSpending.toLocaleString('en-IN')}
          </span>
          <span className="text-xs text-muted-foreground">
            / {budget.amount.toLocaleString('en-IN')}
          </span>
        </div>
        <Progress value={progress} className="h-2 mt-2" />
        <div className="flex justify-between text-xs mt-1">
          <span className="text-muted-foreground">
            Remaining:{' '}
            <span className="font-semibold">
              {remaining.toLocaleString('en-IN')}
            </span>
          </span>
          <span className="text-muted-foreground">{progress}% used</span>
        </div>
      </div>
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogTrigger asChild>
          <Button
            ref={removeBtnRef}
            variant="destructive"
            size="sm"
            className="self-end"
            onClick={() => setConfirmOpen(true)}
          >
            Remove
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Budget</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove{' '}
              <span className="font-semibold">{budget.name}</span>? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                onRemove(budget.id);
                setConfirmOpen(false);
              }}
            >
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AddBudgetDialog({
  onAdd,
}: {
  onAdd: (budget: Omit<Budget, 'id'>) => void;
}) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<Budget['type']>('expense');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [period, setPeriod] = useState<Budget['period']>('monthly');
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const categories = useCategoriesStore((s) => s.categories[type]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !category || !amount) return;
    onAdd({
      type,
      category,
      amount: Number(amount),
      period,
      startDate,
      name,
    });
    setOpen(false);
    setName('');
    setCategory('');
    setAmount('');
    setPeriod('monthly');
    setType('expense');
    setStartDate(new Date().toISOString().slice(0, 10));
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Budget</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Budget</DialogTitle>
        </DialogHeader>
        <form className="flex flex-col gap-3 mt-2" onSubmit={handleSubmit}>
          <div className="flex gap-2">
            <Select
              value={type}
              onValueChange={(v) => {
                setType(v as Budget['type']);
                setCategory('');
              }}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                {typeOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Input
            placeholder="Budget Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <div className="flex gap-2">
            <Input
              type="number"
              min={0}
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="num-inp"
              required
            />
            <Select
              value={period}
              onValueChange={(v) => setPeriod(v as Budget['period'])}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                {periodOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
          <Button type="submit" className="mt-2">
            Add
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function BudgetPage() {
  const budgets = useBudgetStore((s) => s.budgets);
  const addBudget = useBudgetStore((s) => s.addBudget);
  const removeBudget = useBudgetStore((s) => s.removeBudget);

  // Group budgets by type for summary
  const summary = useMemo(() => {
    const result: Record<Budget['type'], { total: number; used: number }> = {
      expense: { total: 0, used: 0 },
      savings: { total: 0, used: 0 },
      investment: { total: 0, used: 0 },
    };
    budgets.forEach((budget) => {
      const { currentSpending } = calculateBudgetProgress(budget);
      result[budget.type].total += budget.amount;
      result[budget.type].used += currentSpending;
    });
    return result;
  }, [budgets]);

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full h-full gap-10 items-center justify-center py-5 md:py-10">
        <div className="page-header pb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="title text-3xl md:text-4xl font-extrabold tracking-tight mb-1">
              Budgets
            </h1>
            <p className="text-base md:text-lg text-muted-foreground font-medium">
              Track your budgets and monitor your progress.
            </p>
          </div>
          <AddBudgetDialog onAdd={addBudget} />
        </div>
        <div className="flex flex-col md:flex-row gap-6 mb-10">
          {(['expense', 'savings', 'investment'] as Budget['type'][]).map(
            (type) => (
              <div
                key={type}
                className="flex-1 min-w-[220px] bg-secondary-block rounded-2xl p-6 border border-border flex flex-col items-center shadow-sm"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ background: COLORS[type] }}
                  ></span>
                  <span className="font-semibold capitalize text-lg">
                    {type}
                  </span>
                </div>
                <div className="text-3xl font-extrabold">
                  {summary[type].used.toLocaleString('en-IN')}
                  <span className="text-base text-muted-foreground font-normal">
                    {' '}
                    / {summary[type].total.toLocaleString('en-IN')}
                  </span>
                </div>
                <Progress
                  value={
                    summary[type].total
                      ? Math.round(
                          (summary[type].used / summary[type].total) * 100
                        )
                      : 0
                  }
                  className="h-2 mt-3"
                />
                <div className="text-xs text-muted-foreground mt-2">
                  {summary[type].total
                    ? Math.round(
                        (summary[type].used / summary[type].total) * 100
                      )
                    : 0}
                  % used
                </div>
              </div>
            )
          )}
        </div>
        <div className="flex flex-col gap-6">
          {budgets.length === 0 ? (
            <div className="text-center text-muted-foreground py-16 text-lg font-medium">
              No budgets yet. Add one to get started!
            </div>
          ) : (
            budgets.map((budget) => (
              <BudgetCard
                key={budget.id}
                budget={budget}
                onRemove={removeBudget}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
