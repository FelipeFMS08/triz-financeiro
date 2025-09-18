import { ChevronLeft, ChevronRight } from "lucide-react";


interface MonthNavigationProps {
  month: string;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
}

export function MonthNavigation({ month, onPreviousMonth, onNextMonth }: MonthNavigationProps) {
  return (
    <div className="fixed z-50 top-0 w-full py-4 px-4 sm:px-6 lg:px-8 bg-white border-b border-b-zinc-300 dark:border-b-zinc-600 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 flex justify-between">
      <ChevronLeft onClick={onPreviousMonth} className="h-6 w-6 " />
      <span className=" font-bold">{month}</span>
      <ChevronRight onClick={onNextMonth} className="h-6 w-6 " />
    </div>
  );
}