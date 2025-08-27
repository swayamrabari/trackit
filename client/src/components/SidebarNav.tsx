import React from 'react';
import { NavLink } from 'react-router-dom';
import navOptions from '../constants/navOtions';

export default function SidebarNav() {
  return (
    <aside className="hidden lg:flex flex-col h-svh w-64 bg-sidebar border-r border-border top-0">
      <div className="px-6 py-7 flex items-center gap-3">
        <img src="/trackit.svg" alt="Trackit Logo" className="h-8" />
        <h1 className="text-[1.35rem] font-logo font-semibold tracking-wide">
          TrackIt
        </h1>
      </div>
      {/* Navigation */}
      <span className="px-6 text-xs font-semibold text-muted-foreground">
        Workspace
      </span>
      <nav className="flex-1 flex flex-col gap-1 w-full overflow-y-auto px-2 py-2">
        {navOptions.map((option) => (
          <NavLink
            key={option.label}
            to={option.path}
            className={({ isActive }) =>
              `transition-all font-semibold w-full flex gap-2 items-center px-3 py-2 rounded-md ${
                isActive ? 'bg-secondary text-foreground' : 'text-foreground/80'
              }`
            }
          >
            {React.cloneElement(option.icon, {
              className: 'h-[20px]',
            })}
            <span className="text-base font-semibold">{option.label}</span>
          </NavLink>
        ))}
      </nav>
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
