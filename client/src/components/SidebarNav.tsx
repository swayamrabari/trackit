import React from "react";
import { NavLink } from "react-router-dom";
import navOptions from "../constants/navOtions";
import AddEntry from "./AddEntry";
import AddBudgetDialog from "./budget/AddBudgetDialog";
import { useBudgetStore } from "@/store/budgetStore";
import { useAuthStore } from "@/store/authStore";
import { useNavigate } from "react-router-dom";

export default function SidebarNav() {
  const addBudget = useBudgetStore((s) => s.addBudget);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <aside className="hidden lg:flex flex-col h-screen w-64 bg-sidebar border-r border-border">
      {/* Logo Section */}
      <div className="px-6 py-6 flex items-center gap-3 border-b border-border">
        <img src="/trackit.svg" alt="Trackit Logo" className="h-8" />
        <h1 className="text-xl font-bold tracking-wide text-white">TrackIt</h1>
      </div>

      {/* Navigation */}
      <div className="flex flex-col flex-1 overflow-y-auto">
        <div className="mt-4 mb-2 px-6 text-xs uppercase font-semibold text-muted-foreground">
          Workspace
        </div>
        <nav className="flex flex-col space-y-1 px-3">
          {navOptions.map((option) => (
            <NavLink
              key={option.label}
              to={option.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 text-sm rounded-lg font-medium transition ${
                  isActive
                    ? "bg-secondary text-white shadow-sm"
                    : "text-muted-foreground hover:bg-secondary/30"
                }`
              }
            >
              {React.cloneElement(option.icon, {
                className: "h-5 w-5",
              })}
              <span>{option.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Actions */}
        <div className="mt-6 mb-2 px-6 text-xs uppercase font-semibold text-muted-foreground">
          Actions
        </div>
        <div className="px-3 space-y-2">
          <AddEntry inSidebar />
          <AddBudgetDialog onAdd={addBudget} inSidebar />
        </div>
      </div>

      {/* User Profile */}
      <div className="mt-auto border-t border-border p-4">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 text-white flex items-center justify-center font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>

          {/* User Info */}
          <div className="flex flex-col">
            <span className="text-sm font-semibold">{user?.name}</span>
            <span className="text-xs text-muted-foreground">{user?.email}</span>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="ml-auto px-1 py-1 text-xs rounded-lg bg-destructive text-white hover:bg-destructive/80 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}
