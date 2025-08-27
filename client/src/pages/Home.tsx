import EntriesTableHead from '@/components/EntriesTableHead';
// import AddEntry from '../components/AddEntry';
import Summary from '../components/Summary';
import EntriesTable from '@/components/EntriesTable';

export default function Home() {
  return (
    <div className="h-fit w-full flex flex-col">
      <Summary />
      <EntriesTableHead
        type=""
        category=""
        onTypeChange={() => {}}
        onCategoryChange={() => {}}
      />
      <EntriesTable />
    </div>
  );
}
