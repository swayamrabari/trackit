import { useState } from 'react';
import EntriesTable from '@/components/EntriesTable';
import EntriesTableHead from '@/components/EntriesTableHead';

export default function Entries() {
  const [filterType, setFilterType] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  return (
    <div className="h-fit w-full flex flex-col items-center sm:py-5">
      <EntriesTableHead
        type={filterType}
        category={filterCategory}
        onTypeChange={(value) => {
          setFilterType(value);
          setFilterCategory('');
        }}
        onCategoryChange={setFilterCategory}
      />
      <EntriesTable type={filterType} category={filterCategory} />
    </div>
  );
}
