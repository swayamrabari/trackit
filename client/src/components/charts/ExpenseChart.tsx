'use client';

import { Pie, PieChart } from 'recharts';
import { useCategoriesStore } from '@/store/categoriesStore';
import { useEntriesStore } from '@/store/entriesStore';
import { useMemo } from 'react';

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

const baseColor = '#FF4457';

export function ExpenseChart() {
  const categories = useCategoriesStore((state) => state.categories.expense);
  const allEntries = useEntriesStore((state) => state.entries);

  const entries = useMemo(
    () => allEntries.filter((entry) => entry.type === 'expense'),
    [allEntries]
  );

  const totalExpense = useMemo(
    () => entries.reduce((acc, entry) => acc + entry.amount, 0),
    [entries]
  );

  const totalExpenseByCategory = useMemo(
    () =>
      categories
        .map((category) => {
          const total = entries
            .filter((entry) => entry.category === category)
            .reduce((acc, entry) => acc + entry.amount, 0);
          const percentage =
            totalExpense > 0
              ? ((total / totalExpense) * 100).toFixed(1)
              : '0.0';
          return {
            category,
            total: total.toFixed(2),
            percentage,
          };
        })
        .sort((a, b) => Number(b.total) - Number(a.total)),
    [categories, entries, totalExpense]
  );

  const chartData = useMemo(
    () =>
      totalExpenseByCategory.reduce((acc, category, index) => {
        if (index < 4) {
          const opacity = Math.round((255 * (100 - index * 15)) / 100);
          const opacityHex = opacity.toString(16).padStart(2, '0');
          acc.push({
            category:
              category.category.charAt(0).toUpperCase() +
              category.category.slice(1),
            fill: `${baseColor}${opacityHex}`,
            total: Number(category.total),
          });
        } else if (index === 4) {
          const otherTotal = totalExpenseByCategory
            .slice(4)
            .reduce((sum, cat) => sum + Number(cat.total), 0);
          const opacity = Math.round((255 * (100 - index * 15)) / 100);
          const opacityHex = opacity.toString(16).padStart(2, '0');
          acc.push({
            category: 'Other Categories',
            total: otherTotal,
            fill: `${baseColor}${opacityHex}`,
          });
        }
        return acc;
      }, [] as { category: string; total: number; fill?: string }[]),
    [totalExpenseByCategory]
  );

  const chartConfig: ChartConfig = useMemo(() => {
    const config: ChartConfig = {};
    categories.forEach((category) => {
      config[category] = {
        label: category,
      };
    });
    return config;
  }, [categories]);

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="chart-container bg-expense/10 border-2 border-expense/20 flex flex-col items-center justify-center rounded-xl p-4 w-full sm:w-1/2">
        <div className="text-center mb-4">
          <h2 className="text-lg font-bold">Expense Distribution</h2>
          <p className="text-sm text-muted-foreground">
            A breakdown of your expenses by category
          </p>
        </div>
        <ChartContainer
          config={chartConfig}
          className="min-h-[260px] sm:max-h-[250px] w-full sm:w-fit flex-1 flex-shrink-0"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              paddingAngle={10}
              innerRadius={80}
              cornerRadius={100}
              dataKey="total"
              nameKey="category"
            />
          </PieChart>
        </ChartContainer>
        <div className="text-center mt-4 text-xs text-muted-foreground">
          Data is based on your recorded expense entries
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="flex gap-4 overflow-hidden bg-expense/10 border-2 border-expense/20 rounded-xl p-4">
          <div className="bg-expense w-1.5 rounded-full"></div>
          <div className="flex flex-col gap-1">
            <div className="text-sm font-semibold text-muted-foreground">
              Total Expenses
            </div>
            <div className="text-2xl font-bold tracking-wide">
              {totalExpense.toLocaleString('en-IN', {
                minimumFractionDigits: 2,
              })}
            </div>
          </div>
        </div>

        <div className="entries-list flex flex-col gap-2 mt-4 max-h-[300px] overflow-auto table-container p-2 border-2 border-expense/25 rounded-xl">
          {totalExpenseByCategory.map((item) => (
            <div
              key={item.category}
              className="grid grid-cols-[50%_25%_25%] items-center text-sm p-2 pr-4 bg-secondary rounded-md"
            >
              <div className="capitalize font-semibold flex items-center gap-3">
                <div className="h-6 w-1 rounded-full bg-expense flex-shrink-0"></div>
                {item.category}
              </div>
              <div className="text-right font-semibold">
                {Number(item.total).toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                })}
              </div>
              <div className="text-right text-muted-foreground font-semibold">
                {item.percentage}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
