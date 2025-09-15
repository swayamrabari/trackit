import { useState } from 'react';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectValue,
} from './ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from './ui/dialog';
import { Button } from './ui/button';
import { CalendarIcon, Plus } from 'lucide-react';
import AddEntryIcon from '../assets/addentey.svg';
import { useCategoriesStore } from '@/store/categoriesStore';
import { Input } from './ui/input';
import { format } from 'date-fns';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { useEntriesStore } from '@/store/entriesStore';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export default function AddEntry({ inSidebar = false }) {
  const [date, setDate] = useState<Date>();
  const [type, setType] = useState('');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const isEligible = type && category && amount > 0 && date;

  const categoriesStore = useCategoriesStore();
  const entryTypes = Object.keys(categoriesStore.categories);

  const relevantCategories =
    categoriesStore.categories[
      type as keyof typeof categoriesStore.categories
    ] || [];

  return (
    <>
      <Dialog>
        {inSidebar ? (
          <DialogTrigger asChild>
            <div className="transition-all font-medium w-full flex gap-2 hover:bg-secondary cursor-pointer items-center justify-start px-2.5 py-2 rounded-md">
              <img
                src={AddEntryIcon}
                alt="Add Entry"
                className="h-[20px] w-[25px]"
              />
              <span className="text-base">Add Entry</span>
            </div>
          </DialogTrigger>
        ) : (
          <DialogTrigger asChild>
            <Button variant="secondary" className="w-10 sm:w-fit font-semibold">
              <Plus className="stroke-[2.5px]" />
              <span className="hidden sm:block">Add</span>
            </Button>
          </DialogTrigger>
        )}
        <DialogContent className="w-full max-h-full sm:w-[400px] overflow-auto">
          <DialogHeader className="mb-2">
            <DialogTitle>Add Entry</DialogTitle>
            <DialogDescription>
              Add a new entry to your records
            </DialogDescription>
          </DialogHeader>
          <Input
            type="number"
            placeholder="0.00"
            className="num-inp caret-muted-foreground h-fit text-4xl appearance-none border-2 focus:outline-none tracking-wide"
            onChange={(e) => setAmount(Number(e.target.value))}
          />
          <Label className="mt-1">Select Entry Type</Label>
          <RadioGroup
            onValueChange={(value) => {
              setType(value);
              setCategory('');
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

          <Label className="mt-3">Select Category</Label>
          <Select
            key={type}
            disabled={!type}
            onValueChange={(value) => setCategory(value)}
          >
            <SelectTrigger
              disabled={!type}
              className="bg-secondary border-none capitalize"
            >
              <SelectValue
                placeholder="Select Category"
                className="w-full text-left"
              />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {relevantCategories.map((category: string) => (
                  <SelectItem
                    key={category}
                    value={category}
                    className="capitalize"
                  >
                    {category}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Label className="mt-3">Select Date</Label>
          <Popover
            modal={true}
            open={datePickerOpen}
            onOpenChange={setDatePickerOpen}
          >
            <PopoverTrigger asChild>
              <Button
                variant="secondary"
                className={cn(
                  'justify-start text-left font-semibold w-full',
                  !date && 'text-muted-foreground'
                )}
              >
                <CalendarIcon />
                {date ? format(date, 'PPP') : <span>Entry Date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(newDate) => {
                  setDate(newDate);
                  setDatePickerOpen(false);
                }}
              />
            </PopoverContent>
          </Popover>
          <DialogClose>
            <Button
              disabled={!isEligible}
              className="font-semibold mt-3 w-full"
              onClick={() => {
                useEntriesStore.getState().addEntry({
                  type,
                  category,
                  amount,
                  date: date ? format(date, 'yyyy-MM-dd') : '',
                });

                setType('');
                setCategory('');
                setAmount(0);
                setDate(undefined);
              }}
            >
              Add Entry
            </Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </>
  );
}
