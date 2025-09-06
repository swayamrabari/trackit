import React, { useState, useEffect } from 'react';
import { Budget } from '@/store/budgetStore';
import { useCategoriesStore } from '@/store/categoriesStore';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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

export function EditBudgetDialog({
  budget,
  onUpdate,
  open,
  onOpenChange,
}: {
  budget: Budget | null;
  onUpdate: (id: string, updatedBudget: Partial<Budget>) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [type, setType] = useState<Budget['type']>('expense');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [period, setPeriod] = useState<Budget['period']>('monthly');
  const categories = useCategoriesStore((s) => s.categories[type]);

  // Initialize form when budget changes
  useEffect(() => {
    if (budget) {
      setType(budget.type);
      setCategory(budget.category);
      setAmount(budget.amount.toString());
      setPeriod(budget.period);
    }
  }, [budget]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!budget || !category || !amount) return;

    onUpdate(budget.id, {
      type,
      category,
      amount: Number(amount),
      period,
    });

    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-h-full sm:w-[400px] overflow-auto">
        <DialogHeader className="mb-2">
          <DialogTitle>Edit Budget</DialogTitle>
        </DialogHeader>
        <form className="flex flex-col gap-3 mt-2" onSubmit={handleSubmit}>
          <Input
            type="number"
            min={0}
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="num-inp caret-muted-foreground h-fit text-4xl appearance-none border-2 focus:outline-none tracking-wide"
            required
          />
          <div className="flex flex-col gap-2">
            <Label className="mt-1 font-semibold">Select Budget Type</Label>
            <Select
              value={type}
              onValueChange={(value) => {
                setType(value as Budget['type']);
                setCategory('');
              }}
            >
              <SelectTrigger className="bg-secondary border-none capitalize">
                <SelectValue
                  placeholder="Budget Type"
                  className="w-full text-left"
                />
              </SelectTrigger>
              <SelectContent>
                {typeOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Label className="mt-3 font-semibold">Select Category</Label>
          <Select value={category} onValueChange={setCategory} disabled={!type}>
            <SelectTrigger className="bg-secondary border-none capitalize">
              <SelectValue
                placeholder="Select Category"
                className="w-full text-left"
              />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat} className="capitalize">
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Label className="mt-3 font-semibold">Select Period</Label>
          <Select
            value={period}
            onValueChange={(v) => setPeriod(v as Budget['period'])}
          >
            <SelectTrigger className="bg-secondary border-none capitalize">
              <SelectValue placeholder="Period" className="w-full text-left" />
            </SelectTrigger>
            <SelectContent>
              {periodOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="submit" className="font-semibold mt-3 w-full">
            Update
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
