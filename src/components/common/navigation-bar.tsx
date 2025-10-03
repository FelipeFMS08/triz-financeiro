"use client";

import { authClient } from "@/lib/auth-client";
import { HomeIcon, ListCheck, PanelLeftDashed, Settings } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import path from "path";

interface NavItem {
  icon: React.ComponentType<any>;
  label: string;
  path: string;
  activeColor: string;
}

const navItems: NavItem[] = [
  {
    icon: HomeIcon,
    label: "Dashboard",
    path: "/",
    activeColor: "#A8E6CF",
  },
  {
    icon: ListCheck,
    label: "Transações",
    path: "/transactions",
    activeColor: "#A8E6CF",
  },
  {
    icon: PanelLeftDashed,
    label: "Relatórios",
    path: "/relatorios",
    activeColor: "#A8E6CF",
  },
  {
    icon: Settings,
    label: "Config",
    path: "/settings",
    activeColor: "#A8E6CF",
  },
];

export function NavigationBar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const { data: session } = authClient.useSession();

  // Evitar hidration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  if (!mounted) {
    return (
      <>
        <div className="h-20"></div>
        <div className="fixed bottom-0 w-full py-4 px-4 sm:px-6 lg:px-8 bg-white dark:bg-zinc-800 flex justify-between border-t border-t-zinc-300 dark:border-t-zinc-600">
          {/* Skeleton loading */}
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-1 w-20 animate-pulse"
            >
              <div className="w-6 h-6 bg-gray-200 rounded"></div>
              <div className="w-12 h-3 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </>
    );
  }

  return (
    <>
      {/* Spacer para ocupar o espaço da navbar fixa */}
      <div className="h-20"></div>

      {/* Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 py-4 px-4 sm:px-6 lg:px-8 bg-white dark:bg-zinc-800 flex justify-between border-t border-t-zinc-300 dark:border-t-zinc-600 z-50">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;

          return (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className="flex flex-col items-center gap-1 w-20 transition-all duration-200 hover:scale-105 active:scale-95"
              aria-label={`Navegar para ${item.label}`}
            >
              {session?.user.image && item.path === '/settings' ? (
                <Avatar className='size-12'>
                  <AvatarImage
                    src={session.user.image}
                    alt="@shadcn"
                  />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
              ) : (
                <>
                  <div className="pb-1 rounded-lg transition-colors duration-200">
                    <Icon
                      className="h-6 w-6"
                      style={{
                        color: isActive ? item.activeColor : undefined,
                      }}
                    />
                  </div>
                  <span
                    className={`font-normal text-sm transition-colors duration-200 ${
                      isActive
                        ? "text-[#A8E6CF]"
                        : "text-zinc-700 dark:text-zinc-400"
                    }`}
                  >
                    {item.label}
                  </span>
                </>
              )}
            </button>
          );
        })}
      </div>
    </>
  );
}
