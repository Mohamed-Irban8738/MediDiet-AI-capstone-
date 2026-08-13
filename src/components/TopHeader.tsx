import React, { useState } from "react";
<<<<<<< HEAD
import { NavView, UserSession } from "../types";
import { LogOut } from "lucide-react";

interface TopHeaderProps {
  currentView: NavView;
  session?: UserSession | null;
  onLogout?: () => void;
=======
import { MOCK_CLINICIAN } from "../data/mockData";
import { NavView } from "../types";

interface TopHeaderProps {
  currentView: NavView;
>>>>>>> 21bfd60dc0b4d8d6e464925f035b5466d515631d
  onMobileMenuToggle: () => void;
  onSearchChange?: (query: string) => void;
  onOpenNotifications?: () => void;
  onOpenHelp?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  currentView,
<<<<<<< HEAD
  session,
  onLogout,
=======
>>>>>>> 21bfd60dc0b4d8d6e464925f035b5466d515631d
  onMobileMenuToggle,
  onSearchChange,
  onOpenNotifications,
  onOpenHelp,
}) => {
  const [searchValue, setSearchValue] = useState("");

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    if (onSearchChange) {
      onSearchChange(e.target.value);
    }
  };

  return (
    <header className="bg-surface dark:bg-surface-dim top-0 h-16 sticky z-40 border-b border-outline-variant dark:border-outline flex justify-between items-center px-lg w-full max-w-container-max mx-auto md:px-xl">
      <div className="flex items-center gap-md">
        {/* Mobile Hamburger Menu */}
        <button
          onClick={onMobileMenuToggle}
          className="md:hidden text-primary cursor-pointer hover:text-on-surface-variant p-2 -ml-2 rounded-md hover:bg-surface-container-high transition-colors"
          aria-label="Toggle menu"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>

        {/* Mobile Title */}
        <div className="md:hidden flex flex-col">
          <span className="font-headline-sm text-headline-sm font-bold text-primary dark:text-primary-fixed">
            MediDiet AI
          </span>
        </div>

        {/* Desktop Header Search Field (when in Patients or General context) */}
        <div className="relative w-64 md:w-80 hidden sm:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant text-[20px]">
            search
          </span>
          <input
            type="text"
            value={searchValue}
            onChange={handleSearchInput}
            placeholder="Search patients, diets, labs..."
            className="w-full bg-surface-container-low border border-outline-variant/50 rounded-full py-2 pl-10 pr-4 font-body-sm text-body-sm text-on-surface focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-colors placeholder:text-outline"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-4 text-on-surface-variant">
        {/* Notifications Button with Red Badge */}
        <button
          onClick={onOpenNotifications}
          className="relative hover:text-primary cursor-pointer active:scale-95 transition-transform p-2 rounded-full hover:bg-surface-container-high border border-transparent"
          title="Notifications"
        >
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-error rounded-full ring-2 ring-surface"></span>
        </button>

        {/* Help Button */}
        <button
          onClick={onOpenHelp}
          className="hover:text-primary cursor-pointer active:scale-95 transition-transform p-2 rounded-full hover:bg-surface-container-high hidden sm:flex border border-transparent"
          title="Clinical Documentation & Support"
        >
          <span className="material-symbols-outlined">help_outline</span>
        </button>

        {/* Clinician Profile Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-outline-variant/60">
          <img
<<<<<<< HEAD
            src={session?.avatarUrl || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80"}
            alt={session?.name || "Dr. Sarah Jenkins"}
            className="w-8 h-8 md:w-9 md:h-9 rounded-full object-cover border border-outline-variant"
          />
          <span className="font-body-sm text-body-sm font-semibold text-on-surface hidden lg:inline">
            {session?.name || "Dr. Sarah Jenkins"}
          </span>
        </div>

        {/* Logout / Switch Role Button */}
        {onLogout && (
          <button
            onClick={onLogout}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-error hover:bg-error/10 border border-error/20 transition-all ml-1"
            title="Log out or switch portal"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        )}
=======
            src={MOCK_CLINICIAN.avatarUrl}
            alt={MOCK_CLINICIAN.name}
            className="w-8 h-8 md:w-9 md:h-9 rounded-full object-cover border border-outline-variant"
          />
          <span className="font-body-sm text-body-sm font-semibold text-on-surface hidden lg:inline">
            Dr. Sarah Jenkins
          </span>
        </div>
>>>>>>> 21bfd60dc0b4d8d6e464925f035b5466d515631d
      </div>
    </header>
  );
};
<<<<<<< HEAD

=======
>>>>>>> 21bfd60dc0b4d8d6e464925f035b5466d515631d
