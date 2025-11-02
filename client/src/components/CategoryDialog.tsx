import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import AddCategoryIcon from '../assets/addcategory.svg';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useCategoriesStore } from '@/store/categoriesStore';
import { toast } from 'sonner';

export function CategoryDialog() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [error, setError] = useState('');

  const { addCategory } = useCategoriesStore();
  const entryTypes = ['income', 'expense', 'investment', 'savings'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!type) {
      setError('Please select a category type');
      return;
    }
    if (!categoryName.trim()) {
      setError('Please enter a category name');
      return;
    }

    // Add category to store
    addCategory(type as 'income' | 'expense' | 'investment' | 'savings', categoryName.toLowerCase().trim());

    // Reset form and close dialog
    setType('');
    setCategoryName('');
    setError('');
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        setError('');
      }}
    >
      <DialogTrigger asChild>
        <div className="transition-all font-medium w-full flex gap-2 hover:bg-secondary cursor-pointer items-center justify-start px-2.5 py-2 rounded-md">
          <img src={AddCategoryIcon} alt="" className="h-[20px] w-[25px]" />
          <span className="text-base">Add Category</span>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Category</DialogTitle>
          <DialogDescription>
            Create a new category for relatability.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
          <Label>Category Type</Label>
          <RadioGroup
            onValueChange={(value) => {
              setType(value);
              setCategoryName('');
            }}
            className="grid grid-cols-2 grid-rows-2 gap-2 font-semibold"
            value={type}
          >
            {entryTypes.map((etype) => (
              <Label
                key={etype}
                htmlFor={etype}
                className={cn(
                  `flex font-bold items-center justify-center rounded-md border-[1.5px] h-10 text-${etype}`,
                  type === etype &&
                  `bg-${etype}/10 border-${etype} transition-all duration-75`
                )}
              >
                <RadioGroupItem value={etype} id={etype} className="sr-only" />
                {etype.charAt(0).toUpperCase() + etype.slice(1)}
              </Label>
            ))}
          </RadioGroup>
          <Label className="mt-3">Category Name</Label>
          <Input
            className="w-full border-2"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            placeholder="Category Name"
          />
          {error && (
            <div className="text-sm text-red-500 font-medium">{error}</div>
          )}
          <Button 
            type="submit" 
            className="w-full"
            disabled={!type || !categoryName.trim()}
          >
            Add Category
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
