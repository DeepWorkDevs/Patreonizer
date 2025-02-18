import React, { useRef, useEffect } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

interface DateRangePickerProps {
  from: Date | undefined;
  to: Date | undefined;
  onSelect: (range: { from: Date | undefined; to: Date | undefined }) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DateRangePicker({
  from,
  to,
  onSelect,
  isOpen,
  onOpenChange
}: DateRangePickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedRange = from && to ? `${format(from, 'MMM d, yyyy')} - ${format(to, 'MMM d, yyyy')}` : 'Select date range';

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onOpenChange(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onOpenChange]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => onOpenChange(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-zinc-800/50 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors text-sm font-medium whitespace-nowrap"
      >
        <CalendarIcon className="w-4 h-4" />
        <span className="hidden sm:inline">{selectedRange}</span>
        <span className="sm:hidden">Date Range</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 z-50">
          <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl max-w-[calc(100vw-2rem)] overflow-x-auto">
            <DayPicker
              mode="range"
              defaultMonth={from}
              selected={{ from, to }}
              onSelect={onSelect}
              numberOfMonths={window.innerWidth < 640 ? 1 : 2}
              className="bg-zinc-900 text-white"
              classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                month: "space-y-4 min-w-[280px]",
                caption: "flex justify-center pt-1 relative items-center",
                caption_label: "text-sm font-medium text-zinc-300",
                nav: "space-x-1 flex items-center",
                nav_button: "h-7 w-7 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-lg transition-colors flex items-center justify-center",
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                table: "w-full border-collapse space-y-1",
                head_row: "flex",
                head_cell: "text-zinc-500 rounded-md w-8 font-normal text-[0.8rem]",
                row: "flex w-full mt-2",
                cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-zinc-800/50 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md",
                day: "h-8 w-8 p-0 font-normal aria-selected:opacity-100 hover:bg-zinc-800 rounded-lg transition-colors",
                day_range_end: "day-range-end",
                day_selected: "bg-[#f45d48] text-white hover:bg-[#f45d48] hover:text-white focus:bg-[#f45d48] focus:text-white",
                day_today: "bg-zinc-800 text-white",
                day_outside: "text-zinc-500 opacity-50",
                day_disabled: "text-zinc-500",
                day_range_middle: "aria-selected:bg-zinc-800/50 aria-selected:text-white",
                day_hidden: "invisible",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}