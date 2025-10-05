import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useEntriesStore } from '@/store/entriesStore';
import { useLocation, Link } from 'react-router-dom';

interface EntriesTableProps {
  type?: string;
  category?: string;
}

const bgClasses: Record<string, string> = {
  income: 'bg-income',
  expense: 'bg-expense',
  investment: 'bg-investment',
  savings: 'bg-savings',
};

const hoverBgClasses: Record<string, string> = {
  income: 'bg-income/10',
  expense: 'bg-expense/10',
  investment: 'bg-investment/10',
  savings: 'bg-savings/10',
};

export default function EntriesTable({ type, category }: EntriesTableProps) {
  const { entries } = useEntriesStore();
  const location = useLocation();

  const filteredEntries = entries.filter((entry) => {
    if (type && entry.type !== type) return false;
    if (category && entry.category !== category) return false;
    return true;
  });

  const displayEntries =
    location.pathname === '/' ? filteredEntries.slice(0, 10) : filteredEntries;

  if (filteredEntries.length === 0) {
    return (
      <div className="w-full text-center py-10 font-semibold">
        No entries found!
      </div>
    );
  }

  return (
    <div className="w-full overflow-auto">
      <Table className="font-semibold hidden sm:table">
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="font-semibold border-none">
          {displayEntries.map((entry) => (
            <TableRow
              key={entry.id}
              className={`hover:${hoverBgClasses[entry.type]}`}
            >
              <TableCell>
                <span
                  className={`capitalize text-${entry.type} bg-${entry.type}/15 px-2 py-1 rounded-md`}
                >
                  {entry.type}
                </span>
              </TableCell>
              <TableCell className="capitalize">{entry.category}</TableCell>
              <TableCell>
                {new Date(entry.date)
                  .toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })
                  .replace(/(\w{3}) (\d{2})/, '$1, $2')}
              </TableCell>
              <TableCell className={`text-right font-bold text-${entry.type}`}>
                {entry.amount.toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="w-full">
        {/* Mobile View Card */}
        <div className="flex flex-col gap-5 sm:hidden">
          {displayEntries.map((entry) => (
            <div
              key={entry.id}
              className={`rounded-lg p-4 ${
                bgClasses[entry.type] || 'bg-secondary'
              } bg-opacity-5 border-2 border-${entry.type} border-opacity-20`}
            >
              {/* Card Header */}
              <div className="flex justify-between items-center mb-2">
                <span
                  className={`text-sm font-medium capitalize ${
                    bgClasses[entry.type] || 'bg-secondary'
                  } text-${
                    entry.type
                  } bg-opacity-20 px-2 py-1 rounded-md font-semibold`}
                >
                  {entry.category}
                </span>
                <span className={`text-lg font-bold text-${entry.type}`}>
                  {entry.amount.toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
              {/* Card Footer */}
              <div className="flex items-center justify-between text-sm capitalize font-semibold">
                <span>{entry.type}</span>
                <span>
                  {new Date(entry.date)
                    .toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })
                    .replace(/(\w{3}) (\d{2})/, '$1, $2')}
                </span>
              </div>
            </div>
          ))}
        </div>{' '}
      </div>
      {location.pathname === '/' && displayEntries.length > 0 && (
        <Link
          to="/entries"
          className="text-blue-500 hover:underline font-semibold w-full text-center block mt-5"
        >
          View all entries
        </Link>
      )}
    </div>
  );
}
