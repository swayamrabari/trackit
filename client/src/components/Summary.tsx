import { useState } from 'react';
import { useEntriesStore } from '@/store/entriesStore';
import FilterDialog from '@/components/FilterDialog';

export default function Summary() {
  const { entries, mainEntries } = useEntriesStore();
  const [filterType, setFilterType] = useState('all');
  const [filterMonth, setFilterMonth] = useState<number | null>(null);
  const [filterYear, setFilterYear] = useState<number | null>(null);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  // Month names for display
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  // Calculate filtered data based on the filter type and value
  const filteredData = (() => {
    if (filterType === 'all') {
      return mainEntries; // Return all data if no filter is applied
    }

    // Filter entries based on the selected time period
    const filteredEntries = entries.filter((entry) => {
      const entryDate = new Date(entry.date);
      const entryMonth = entryDate.getMonth() + 1; // 1-12
      const entryYear = entryDate.getFullYear();

      if (filterType === 'month' && filterMonth && filterYear) {
        return entryMonth === filterMonth && entryYear === filterYear;
      } else if (filterType === 'year' && filterYear) {
        return entryYear === filterYear;
      } else if (filterType === 'custom' && startDate && endDate) {
        return entryDate >= startDate && entryDate <= endDate;
      } else if (filterType === 'quarter' && filterYear) {
        // Calculate quarter (1-4) from month
        const quarter = Math.floor((entryMonth - 1) / 3) + 1;
        return quarter === filterMonth && entryYear === filterYear;
      }
      return true;
    });

    // Aggregate the filtered entries by type
    return filteredEntries.reduce(
      (
        acc: {
          income: number;
          expense: number;
          investment: number;
          savings: number;
        },
        entry
      ) => {
        const type = entry.type as
          | 'income'
          | 'expense'
          | 'investment'
          | 'savings';
        acc[type] = (acc[type] || 0) + entry.amount;
        return acc;
      },
      { income: 0, expense: 0, investment: 0, savings: 0 }
    );
  })();

  const total =
    filteredData.expense + filteredData.investment + filteredData.savings;
  const expensePercent = total ? (filteredData.expense / total) * 100 : 0;
  const investmentPercent = total ? (filteredData.investment / total) * 100 : 0;
  const savingsPercent = total ? (filteredData.savings / total) * 100 : 0;

  // Get the filter display text
  const getFilterDisplayText = () => {
    if (filterType === 'all') {
      return 'All Time';
    } else if (filterType === 'month' && filterMonth && filterYear) {
      return `${monthNames[filterMonth - 1]} ${filterYear}`;
    } else if (filterType === 'year' && filterYear) {
      return `Year ${filterYear}`;
    } else if (filterType === 'quarter' && filterMonth && filterYear) {
      return `Q${filterMonth} ${filterYear}`;
    } else if (filterType === 'custom' && startDate && endDate) {
      return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
    }
    return 'Select Filter';
  };

  // Handle filter changes from the dialog
  const handleFilterChange = (
    type: string,
    month: number | null,
    year: number | null,
    start: Date | undefined,
    end: Date | undefined
  ) => {
    setFilterType(type);
    setFilterMonth(month);
    setFilterYear(year);
    setStartDate(start);
    setEndDate(end);
  };

  return (
    <div className="h-auto w-full flex flex-col mt-5 sm:mt-10 gap-5 mb-5">
      <div className="summary-card flex flex-col gap-5 md:0 place-items-center">
        <div className="page-header w-full flex items-center justify-between pb-5">
          <div className="head">
            <h1 className="title text-2xl md:text-3xl font-bold">Summary</h1>
            <p className="text-sm md:text-base text-muted-foreground font-semibold">
              Overview of your financial tracks.
            </p>
          </div>
          <div>
            <FilterDialog
              filterType={filterType}
              filterMonth={filterMonth}
              filterYear={filterYear}
              startDate={startDate}
              endDate={endDate}
              onFilterChange={handleFilterChange}
              displayText={getFilterDisplayText()}
            />
          </div>
        </div>
        <div className="amount-info w-full grid grid-cols-2 grid-flow-row md: items-center justify-between text-foreground">
          <div className="total">
            <div className="text-lg font-bold text-muted-foreground">
              Net Total
            </div>
            <div className="amount flex items-baseline gap-1">
              <div className="text-2xl font-bold tracking-wider">
                {(
                  filteredData.income -
                  filteredData.expense +
                  filteredData.investment +
                  filteredData.savings
                ).toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                })}
              </div>
            </div>
          </div>
          <div className="line h-2 flex gap-1  rounded-full box-content p-1 ">
            <div
              className="expense h-full bg-expense transition-all duration-1000 rounded-full"
              style={{
                width: `${Math.min(Math.max(expensePercent, 2), 100)}%`,
              }}
            />
            <div
              className="investment h-full bg-investment transition-all duration-1000 rounded-full"
              style={{
                width: `${Math.min(Math.max(investmentPercent, 2), 100)}%`,
              }}
            />
            <div
              className="savings h-full bg-savings transition-all duration-1000 rounded-full"
              style={{
                width: `${Math.min(Math.max(savingsPercent, 2), 100)}%`,
              }}
            />
          </div>
        </div>
      </div>
      <div className="summary-report font-bold grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-7 md:grid-cols-4 md:gap-5 mt-5 sm:mt-5">
        <div className="income py-3 px-4 sm:border-none bg-income/15 rounded-lg">
          <div className="title text-base mb-1 text-income">Income</div>
          <div className="amount text-xl font-bold text-foreground">
            {filteredData.income.toLocaleString('en-IN', {
              minimumFractionDigits: 2,
            })}
          </div>
        </div>
        <div className="expense py-3 px-4 sm:border-none bg-expense/15  rounded-lg">
          <div className="text-base mb-1 text-expense flex items-center justify-between">
            <div className="title">Expense</div>
            <div className="percentage">{expensePercent.toFixed(2)}%</div>
          </div>
          <div className="amount text-xl font-bold text-foreground">
            {filteredData.expense.toLocaleString('en-IN', {
              minimumFractionDigits: 2,
            })}
          </div>
        </div>
        <div className="investment py-3 px-4 sm:border-none bg-investment/15 rounded-lg">
          <div className="text-base mb-1 text-investment flex items-center justify-between">
            <div className="title">Investment</div>
            <div className="percentage">{investmentPercent.toFixed(2)}%</div>
          </div>
          <div className="amount text-xl font-bold text-foreground">
            {filteredData.investment.toLocaleString('en-IN', {
              minimumFractionDigits: 2,
            })}
          </div>
        </div>
        <div className="savings py-3 px-4 sm:border-none bg-savings/15  rounded-lg">
          <div className="text-base mb-1 text-savings flex items-center justify-between">
            <div className="title">Savings</div>
            <div className="percentage">{savingsPercent.toFixed(2)}%</div>
          </div>
          <div className="amount text-xl font-bold text-foreground">
            {filteredData.savings.toLocaleString('en-IN', {
              minimumFractionDigits: 2,
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
