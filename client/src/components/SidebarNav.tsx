import React from 'react';
import { NavLink } from 'react-router-dom';
import navOptions from '../constants/navOtions';
import AddEntry from './AddEntry';
import AddBudgetDialog from './budget/AddBudgetDialog';
import { useBudgetStore } from '@/store/budgetStore';
import { useAuthStore } from '@/store/authStore';

export default function SidebarNav() {
  const addBudget = useBudgetStore((s) => s.addBudget);
  const user = useAuthStore((s) => s.user);
  return (
    <aside className="hidden tracking-normal lg:flex flex-col h-svh w-64 bg-sidebar border-r border-border top-0">
      <div className="px-6 py-7 flex items-center gap-3">
        <img src="/trackit.svg" alt="Trackit Logo" className="h-8" />
        <h1 className="text-[1.35rem] font-logo font-semibold tracking-wide">
          TrackIt
        </h1>
      </div>
      {/* Navigation */}
      <div className="workspace flex flex-col">
        <span className="px-6 text-xs tracking-wide font-semibold text-muted-foreground">
          Workspace
        </span>
        <nav className="flex flex-col w-full overflow-y px-2 py-1">
          {navOptions.map((option) => (
            <NavLink
              key={option.label}
              to={option.path}
              className={({ isActive }) =>
                `transition-all font-semibold w-full flex gap-2 items-center px-3 py-2 rounded-md ${
                  isActive ? 'bg-secondary' : ''
                }`
              }
            >
              {React.cloneElement(option.icon, {
                className: 'h-[20px]',
              })}
              <span className="text-base font-medium">{option.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
      <div className="actions mt-2">
        <span className="px-6 text-xs tracking-wide font-semibold text-muted-foreground">
          Actions
        </span>
        {/* display here add entry and budget dialogue triggers */}
        <div className="px-2 py-1 flex flex-col select-none">
          <AddEntry inSidebar />
          <AddBudgetDialog onAdd={addBudget} inSidebar />
        </div>
      </div>
      {/* Avatar */}
      <div className="mt-auto p-2">
        <div className="flex items-center gap-3 p-4 bg-secondary rounded-md">
          <div className="h-10 w-10 rounded-full bg-foreground text-secondary text-xl flex items-center justify-center font-bold">
            {user?.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col gap-[-5px]">
            <span className="font-semibold">{user?.name}</span>
            <span className="text-sm font-semibold text-muted-foreground">
              {user?.email}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
