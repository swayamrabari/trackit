import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AddBudgetSvg from '../../assets/addbudgetsvg.svg';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { useCategoriesStore } from '@/store/categoriesStore';
import { Budget } from '@/store/budgetStore';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { SelectGroup } from '@radix-ui/react-select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';

type AddBudgetDialogProps = {
  onAdd: (budget: Omit<Budget, 'id'>) => void;
  inSidebar?: boolean;
};

export default function AddBudgetDialog({
  onAdd,
  inSidebar,
}: AddBudgetDialogProps) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState('');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [period, setPeriod] = useState('');
  const categories = useCategoriesStore(
    (state) => state.categories[type as keyof typeof state.categories]
  );
  const [error, setError] = useState('');

  const typeOptions = ['expense', 'savings', 'investment'];

  const periodOptions = ['monthly', 'quarterly', 'half-yearly', 'yearly'];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!category || !amount) {
      setError('Please fill all fields');
      return;
    }
    if (Number(amount) <= 0) {
      setError('Amount must be positive');
      return;
    }
    onAdd({
      type,
      category,
      amount: Number(amount),
      period,
      spent: 0,
    });
    setOpen(false);
    setCategory('');
    setAmount('');
    setPeriod('monthly');
    setType('expense');
    setError('');
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        setError('');
      }}
    >
      {inSidebar ? (
        <DialogTrigger asChild>
          <div className="transition-all font-medium w-full flex gap-2 hover:bg-secondary cursor-pointer items-center justify-start px-2.5 py-2 rounded-md">
            <img
              src={AddBudgetSvg}
              alt="Add Entry"
              className="h-[20px] w-[25px]"
            />
            <span className="text-base">Add Budget</span>
          </div>
        </DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button variant="secondary" className="w-10 sm:w-fit font-semibold">
            <Plus className="stroke-[2.5px]" />
            <span className="hidden sm:block">Add Budget</span>
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="w-full max-h-full sm:w-[520px] overflow-auto">
        <DialogHeader className="mb-2">
          <DialogTitle>Add Budget</DialogTitle>
          <DialogDescription>
            Create a new budget for a category and period.
          </DialogDescription>
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
          <Label className="mt-3 font-semibold">Select Budget Type</Label>
          <RadioGroup
            value={type}
            onValueChange={(v) => {
              setType(v as Budget['type']);
              setCategory('');
            }}
            className="flex flex-col sm:flex-row gap-2 font-semibold"
          >
            {typeOptions.map((btype) => {
              const uniqueId = `dialog-budget-type-${btype}`;
              return (
                <Label
                  key={btype}
                  htmlFor={uniqueId}
                  className={cn(
                    `flex flex-1 font-bold items-center justify-center rounded-md border-[1.5px] min-h-10 text-${btype}`,
                    type === btype &&
                    `bg-${btype}/10 border-${btype} transition-all duration-75`
                  )}
                >
                  <RadioGroupItem value={btype} id={uniqueId} className="sr-only" />
                  {btype.charAt(0).toUpperCase() + btype.slice(1)}
                </Label>
              );
            })}
          </RadioGroup>
          <Label className="mt-3 font-semibold">Select Category</Label>
          <Select value={category} onValueChange={setCategory} disabled={!type}>
            <SelectTrigger className="bg-secondary border-none capitalize">
              <SelectValue
                placeholder="Select Category"
                className="w-full text-left"
              />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {(categories ?? []).map((cat) => (
                  <SelectItem key={cat} value={cat} className="capitalize">
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </SelectItem>
                ))}
              </SelectGroup>
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
              {periodOptions.map((p) => (
                <SelectItem key={p} value={p} className="capitalize">
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {error && (
            <div className="text-sm text-red-500 font-medium">{error}</div>
          )}
          <Button 
            type="submit" 
            className="font-semibold mt-3 w-full"
            disabled={!type || !category || !amount || !period || Number(amount) <= 0}
          >
            Add
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
