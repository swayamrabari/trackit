import { IncomeChart } from '../components/charts/IncomeChart';
import { ExpenseChart } from '../components/charts/ExpenseChart';
import { InvestmentChart } from '@/components/charts/InvestmentChart';
import { SavingsChart } from '@/components/charts/SavingsChart';
export default function Insights() {
  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full h-full gap-10 items-center justify-center py-5 md:py-10">
        <div className="page-header pb-5">
          <h1 className="title text-2xl md:text-3xl font-bold">Insights</h1>
          <p className="text-sm md:text-base text-muted-foreground font-semibold">
            Gain insights into your financial habits.
          </p>
        </div>
        <div className="charts-container flex flex-col gap-4 w-full">
          <IncomeChart />
          <ExpenseChart />
          <SavingsChart />
          <InvestmentChart />
        </div>
      </div>
    </div>
  );
}
