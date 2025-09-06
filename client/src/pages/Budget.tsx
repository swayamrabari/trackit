import { useMemo, useState } from 'react';
import {
  useBudgetStore,
  calculateBudgetProgress,
  Budget,
} from '@/store/budgetStore';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Pencil, Trash } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { EditBudgetDialog } from '@/components/budget/EditBudgetDialog';
import { useEntriesStore } from '@/store/entriesStore';
import AddBudgetDialog from '@/components/budget/AddBudgetDialog';

function BudgetCard({
  budget,
  onRemove,
  onEdit,
}: {
  budget: Budget;
  onRemove: (id: string) => void;
  onEdit: (budget: Budget) => void;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { currentSpending, progress, remaining } =
    calculateBudgetProgress(budget);

  // Determine status based on budget type and percentage
  const getStatusInfo = () => {
    if (budget.type === 'expense') {
      if (progress < 70) {
        return {
          label: 'Safe',
          color: 'bg-income',
          textColor: 'text-income',
        };
      } else if (progress < 90) {
        return {
          label: 'Warning',
          color: 'bg-savings',
          textColor: 'text-savings',
        };
      } else {
        return {
          label: 'Critical',
          color: 'bg-expense',
          textColor: 'text-expense',
        };
      }
    } else {
      // For savings and investment
      if (progress < 30) {
        return {
          label: 'Behind Target',
          color: 'bg-expense',
          textColor: 'text-expense',
        };
      } else if (progress < 70) {
        return {
          label: 'Progressing',
          color: 'bg-savings',
          textColor: 'text-savings',
        };
      } else {
        return {
          label: 'On Track',
          color: 'bg-income',
          textColor: 'text-income',
        };
      }
    }
  };

  const status = getStatusInfo();

  return (
    <div className="flex bg-accent/30 items-center gap-6 rounded-xl px-5 py-4 border-2 border-border shadow-md transition-all hover:shadow-lg relative">
      <div className="flex-1 flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-xl md:text-xl capitalize">
            {budget.category}
          </span>
        </div>
        <div className="flex items-center gap-2 *:rounded-md *:px-2.5 *:py-1 *:text-xs *:font-semibold">
          <div
            className={`${
              status.textColor
            } bg-opacity-10 ${status.color.replace(
              'bg-',
              'bg-opacity-10 bg-'
            )}`}
          >
            {status.label}
          </div>
          <div className="text-foreground/80 bg-muted capitalize">
            {budget.period}
          </div>
        </div>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-2xl font-bold text-primary">
            {currentSpending.toLocaleString('en-IN')}
          </span>
          <span className="text-base text-muted-foreground font-semibold">
            / {budget.amount.toLocaleString('en-IN')}
          </span>
        </div>
        <Progress value={progress} className="h-2 mt-1" />
        <div className="flex justify-between text-sm mt-1 font-semibold">
          <span className="text-muted-foreground">
            Remaining: <span>{remaining.toLocaleString('en-IN')}</span>
          </span>
          <span>{progress}% Used</span>
        </div>
      </div>

      {/* Edit and Delete Buttons */}
      <div className="flex absolute top-3 right-3 gap-2">
        <button
          className="h-9 w-9 flex items-center justify-center rounded-md bg-muted hover:bg-primary/10 text-primary transition"
          onClick={() => onEdit(budget)}
          aria-label="Edit Budget"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          className="h-9 w-9 flex items-center justify-center rounded-md bg-expense/15 hover:bg-expense/20 text-expense/80 transition"
          onClick={() => setConfirmOpen(true)}
          aria-label="Delete Budget"
        >
          <Trash className="h-[18px]" />
        </button>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Budget</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{' '}
              <span className="font-semibold capitalize">
                {budget.category}
              </span>
              ? This action cannot be undone.
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
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function BudgetPage() {
  const budgets = useBudgetStore((s) => s.budgets);
  const addBudget = useBudgetStore((s) => s.addBudget);
  const removeBudget = useBudgetStore((s) => s.removeBudget);
  const updateBudget = useBudgetStore((s) => s.updateBudget);

  // Subscribe to entries to trigger re-render when entries change
  const entries = useEntriesStore((s) => s.entries);

  const [editBudget, setEditBudget] = useState<Budget | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const handleEditBudget = (budget: Budget) => {
    setEditBudget(budget);
    setEditDialogOpen(true);
  };

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
  }, [budgets, entries]); // Add entries as a dependency here

  // Group budgets by type
  const groupedBudgets = useMemo(() => {
    const groups: Record<Budget['type'], Budget[]> = {
      expense: [],
      savings: [],
      investment: [],
    };

    budgets.forEach((budget) => {
      groups[budget.type].push(budget);
    });

    return groups;
  }, [budgets]);

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full h-full gap-10 items-center justify-center py-5 md:py-10">
        <div className="page-header flex items-center justify-between pb-5">
          <div>
            <h1 className="title text-2xl md:text-3xl font-bold">Budgets</h1>
            <p className="text-sm md:text-base text-muted-foreground font-semibold">
              Manage your budgets and track your spending
            </p>
          </div>
          <div>
            <AddBudgetDialog onAdd={addBudget} />
          </div>
        </div>

        {/* Summary section */}
        <div className="flex flex-col md:flex-row gap-6 mb-10">
          {(['expense', 'savings', 'investment'] as Budget['type'][]).map(
            (type) => (
              <div
                key={type}
                className={`flex-1 min-w-[220px] bg-${type}/10 rounded-xl px-6 py-4 border-2 border-${type}/20 flex flex-col items-center shadow-sm`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`font-bold tracking-wide capitalize text-lg text-${type}`}
                  >
                    {type}
                  </span>
                </div>
                <div className="text-2xl font-extrabold">
                  {summary[type].used.toLocaleString('en-IN')}
                  <span className="text-base text-muted-foreground font-semibold">
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
                <div className="text-xs text-foreground/70 mt-3">
                  {summary[type].total
                    ? Math.round(
                        (summary[type].used / summary[type].total) * 100
                      )
                    : 0}
                  % Used
                </div>
              </div>
            )
          )}
        </div>

        <div className="flex flex-col gap-10">
          {budgets.length === 0 ? (
            <div className="text-center text-muted-foreground py-16 text-lg font-medium">
              No budgets yet. Add one to get started!
            </div>
          ) : (
            Object.entries(groupedBudgets).map(([type, typeBudgets]) =>
              typeBudgets.length > 0 ? (
                <div key={type} className="budget-group">
                  <div className="mb-3">
                    <h2 className="text-xl bg- font-bold capitalize">
                      {type} Budgets
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {typeBudgets.map((budget) => (
                      <BudgetCard
                        key={budget.id}
                        budget={budget}
                        onRemove={removeBudget}
                        onEdit={handleEditBudget}
                      />
                    ))}
                  </div>
                </div>
              ) : null
            )
          )}
        </div>
      </div>

      {/* Edit Budget Dialog */}
      <EditBudgetDialog
        budget={editBudget}
        onUpdate={updateBudget}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />
    </div>
  );
}
