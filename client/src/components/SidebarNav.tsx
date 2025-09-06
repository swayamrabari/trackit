import React from 'react';
import { NavLink } from 'react-router-dom';
import navOptions from '../constants/navOtions';
import AddEntry from './AddEntry';
import AddBudgetDialog from './budget/AddBudgetDialog';
import { useBudgetStore } from '@/store/budgetStore';

export default function SidebarNav() {
  const addBudget = useBudgetStore((s) => s.addBudget);

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
      {/* <div className="profile p-5 border-t border-border">
        <div className="avatar h-10 w-10 bg-muted/50 rounded-full flex items-center justify-center">
          <div className="flex h-full w-full items-center justify-center rounded-full bg-secondary">
            <span className="text-secondary-foreground/80 font-semibold text-base">
              SR
            </span>
          </div>
        </div>
      </div> */}
    </aside>
  );
}
