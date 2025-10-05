import { useLocation } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogTrigger,
} from '@/components/ui/dialog';
import AddEntry from './AddEntry';
import { useCategoriesStore } from '@/store/categoriesStore';
import { Button } from '@/components/ui/button';
import { Filter, FilterX } from 'lucide-react';

interface EntriesTableHeadProps {
  type: string;
  category: string;
  onTypeChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  className?: string;
}

export default function EntriesTableHead({
  type,
  category,
  onTypeChange,
  onCategoryChange,
  className = '',
}: EntriesTableHeadProps) {
  const location = useLocation();
  // Do not show filters on home route (assumes home route path is "/")
  const showFilters = location.pathname !== '/';

  const categories = useCategoriesStore((state) => state.categories);
  const entryTypes = Object.keys(categories);
  const relevantCategories =
    (categories[type as keyof typeof categories] as string[]) || [];

  const resetFilters = () => {
    onTypeChange('');
    onCategoryChange('');
  };

  return (
    <div
      className={`w-full bg-background py-5 flex items-center justify-between border-none sm:border-b border-border ${className}`}
    >
      <div>
        <div
          className={`title font-bold ${
            location.pathname === '/' ? 'text-2xl' : 'text-3xl'
          }`}
        >
          Entries
        </div>
        <div
          className={`text-muted-foreground font-semibold ${
            location.pathname === '/' ? 'text-sm' : 'text-sm md:text-base'
          } ${location.pathname === '/' ? '' : 'hidden sm:block'}`}
        >
          Recent entries in your account
        </div>
      </div>
      <div className="flex gap-3">
        {showFilters && (
          <>
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="secondary"
                  className="w-10 sm:w-fit font-semibold"
                >
                  <Filter className="stroke-[2.5px]" />
                  <span className="hidden sm:block">Filter</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="w-full max-h-full sm:w-[400px] overflow-auto">
                <DialogHeader className="mb-2">
                  <DialogTitle>Filter Entries</DialogTitle>
                  <DialogDescription>
                    Filter entries by type and category
                  </DialogDescription>
                </DialogHeader>
                <Select value={type} onValueChange={onTypeChange}>
                  <SelectTrigger className="bg-secondary">
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {entryTypes.map((entryType) => (
                        <SelectItem key={entryType} value={entryType}>
                          {entryType.charAt(0).toUpperCase() +
                            entryType.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <Select
                  value={category}
                  onValueChange={onCategoryChange}
                  disabled={!type}
                >
                  <SelectTrigger className="bg-secondary">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {relevantCategories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <Button
                  variant="secondary"
                  type="button"
                  className="w-full mt-4 font-semibold"
                  onClick={resetFilters}
                >
                  Reset
                </Button>
                <DialogClose>
                  <Button className="w-full font-semibold">Apply</Button>
                </DialogClose>
              </DialogContent>
            </Dialog>

            <Button
              onClick={resetFilters}
              className="btn btn-secondary w-10 sm:w-fit font-semibold"
              type="button"
              variant="secondary"
            >
              <FilterX />
              <span className="hidden sm:block">Reset</span>
            </Button>
          </>
        )}
        <AddEntry />
      </div>
    </div>
  );
}
