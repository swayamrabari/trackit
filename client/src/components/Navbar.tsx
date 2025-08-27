import React from 'react';
import { NavLink } from 'react-router-dom';
import navOptions from '../constants/navOtions';

export default function Navbar() {
  return (
    <>
      <header className="sticky lg:hidden top-0 w-screen border-b flex items-center justify-center border-border bg-background z-30">
        <div className="max-w-[1000px] w-full flex items-center justify-between py-5 px-5 lg:px-0">
          <img src="/trackit.svg" alt="Trackit Logo" className="h-8" />
          {/* Navigation */}
          <nav className="hidden items-center gap-3 sm:flex">
            {navOptions.map((option) => (
              <NavLink
                key={option.label}
                to={option.path}
                className={({ isActive }) =>
                  `transition-all font-semibold items-center gap-2 flex px-4 py-2 rounded-md ${
                    isActive ? 'text-foreground' : 'text-muted-foreground'
                  }`
                }
              >
                {React.cloneElement(option.icon, {
                  className: 'h-5 w-5 stroke-[2.2px]',
                })}
                <span>{option.label}</span>
              </NavLink>
            ))}
          </nav>
          {/* Avatar */}
          <div className="avatar h-10 w-10 bg-muted/50 rounded-full flex items-center justify-center">
            <div className="flex h-full w-full items-center justify-center rounded-full bg-secondary">
              <span className="text-secondary-foreground/80 font-semibold text-base">
                SR
              </span>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
