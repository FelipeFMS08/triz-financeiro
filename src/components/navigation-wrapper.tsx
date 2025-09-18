"use client";

import { usePathname } from "next/navigation";
import { NavigationBar } from "./common/navigation-bar";

export function NavigationWrapper() {
  const pathname = usePathname();

  // não mostrar em /login
  if (pathname === "/login") return null;

  return <NavigationBar />;
}
