import { NavLink } from 'react-router-dom';
import React from 'react';
import navOptions from '../constants/navOtions';

function MobileNavbar() {
  return (
    <nav className="sticky bottom-0 z-30 grid grid-cols-4 gap-10 sm:hidden w-full py-4 pb-5 bg-background border-t border-border px-5 ">
      {navOptions.map((option) => (
        <NavLink
          key={option.label}
          to={option.path}
          className={({ isActive }) =>
            `transition-all duration-75 font-semibold flex flex-col items-center justify-center gap-1 ${
              isActive ? 'text-foreground' : 'text-muted-foreground'
            }`
          }
        >
          {React.cloneElement(option.icon, {
            className: 'stroke-[2.2px]',
          })}
          <span className="text-sm">{option.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

export default MobileNavbar;
