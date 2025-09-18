import { NavigationBar } from "./common/navigation-bar";

interface PageWrapperProps {
  children: React.ReactNode;
  hasBottomNav?: boolean;
  className?: string;
}

export function PageWrapper({ 
  children, 
  hasBottomNav = true, 
  className = "" 
}: PageWrapperProps) {
  return (
    <div className={`min-h-screen ${className} bg-white dark:bg-zinc-800 dark:text-zinc-300`}>
      <div className={hasBottomNav ? "pb-20" : "pb-0"}>
        {children}
      </div>
    </div>
  );
}