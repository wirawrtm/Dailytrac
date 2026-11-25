import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, RotateCcw } from 'lucide-react';
import { MONTH_NAMES, MONTH_NAMES_ID, generateMonthGrid, formatDateToISO } from '../utils/dateUtils';

interface MonthCalendarPickerProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onClose: () => void;
  align?: 'left' | 'center' | 'right';
}

export const MonthCalendarPicker: React.FC<MonthCalendarPickerProps> = ({
  selectedDate,
  onSelectDate,
  onClose,
  align = 'left',
}) => {
  const [viewDate, setViewDate] = useState<Date>(new Date(selectedDate));
  const [pickerMode, setPickerMode] = useState<'days' | 'months'>('days');

  const monthGrid = generateMonthGrid(viewDate, selectedDate);
  const currentYear = viewDate.getFullYear();
  const currentMonthIdx = viewDate.getMonth();

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(new Date(currentYear, currentMonthIdx - 1, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(new Date(currentYear, currentMonthIdx + 1, 1));
  };

  const handleSelectDay = (date: Date) => {
    onSelectDate(date);
    onClose();
  };

  const handleSelectMonthIdx = (mIdx: number) => {
    const newD = new Date(currentYear, mIdx, Math.min(selectedDate.getDate(), 28));
    setViewDate(newD);
    onSelectDate(newD);
    setPickerMode('days');
  };

  const handleJumpToToday = () => {
    const today = new Date();
    setViewDate(today);
    onSelectDate(today);
    onClose();
  };

  const alignClass = 
    align === 'right' ? 'right-0' : 
    align === 'center' ? 'left-1/2 -translate-x-1/2' : 
    'left-0';

  return (
    <div 
      className={`absolute top-full mt-2 z-50 w-72 sm:w-80 bg-white rounded-3xl shadow-2xl shadow-sky-500/10 border border-sky-100 p-3.5 text-slate-800 animate-in fade-in zoom-in-95 duration-150 ${alignClass}`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Popover Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
        <button
          type="button"
          onClick={() => setPickerMode(pickerMode === 'days' ? 'months' : 'days')}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl hover:bg-sky-50 text-xs font-bold text-slate-900 transition-colors cursor-pointer"
        >
          <CalendarIcon className="w-3.5 h-3.5 text-[#0ea5e9]" />
          <span>{MONTH_NAMES[currentMonthIdx]} {currentYear}</span>
          <span className="text-[10px] text-[#0284c7] bg-sky-50 px-1.5 py-0.5 rounded-full font-semibold">
            {pickerMode === 'days' ? 'Pilih Bulan' : 'Kalender'}
          </span>
        </button>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1 rounded-xl text-slate-500 hover:text-[#0284c7] hover:bg-sky-50 transition-colors cursor-pointer"
            title="Bulan Sebelumnya"
          >
            <ChevronLeft className="w-4 h-4 stroke-[2.2]" />
          </button>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1 rounded-xl text-slate-500 hover:text-[#0284c7] hover:bg-sky-50 transition-colors cursor-pointer"
            title="Bulan Berikutnya"
          >
            <ChevronRight className="w-4 h-4 stroke-[2.2]" />
          </button>
        </div>
      </div>

      {/* Picker Body */}
      {pickerMode === 'months' ? (
        <div className="grid grid-cols-3 gap-1.5 py-1">
          {MONTH_NAMES_ID.map((mName, idx) => {
            const isSelectedMonth = idx === currentMonthIdx;
            return (
              <button
                key={mName}
                type="button"
                onClick={() => handleSelectMonthIdx(idx)}
                className={`py-2 px-1 rounded-2xl text-xs font-bold transition-all cursor-pointer text-center ${
                  isSelectedMonth
                    ? 'bg-[#38bdf8] text-white shadow-md shadow-sky-500/20'
                    : 'text-slate-700 hover:bg-sky-50 hover:text-[#0284c7]'
                }`}
              >
                {mName}
              </button>
            );
          })}
        </div>
      ) : (
        <div>
          {/* Day Headers (Sen - Min) */}
          <div className="grid grid-cols-7 text-center mb-1">
            {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((d) => (
              <span key={d} className="text-[11px] font-bold text-slate-400 py-1">
                {d}
              </span>
            ))}
          </div>

          {/* Calendar Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {monthGrid.map((dayItem, idx) => {
              const isSelected = formatDateToISO(dayItem.date) === formatDateToISO(selectedDate);
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectDay(dayItem.date)}
                  className={`h-8 w-8 mx-auto rounded-full text-xs font-semibold flex items-center justify-center transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-[#38bdf8] text-white font-bold shadow-md shadow-sky-500/25 ring-2 ring-sky-200'
                      : dayItem.isToday
                      ? 'bg-amber-100 text-amber-900 font-bold border border-amber-300'
                      : dayItem.isCurrentMonth
                      ? 'text-slate-700 hover:bg-sky-50 hover:text-[#0284c7]'
                      : 'text-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {dayItem.dayNumber}
                  {dayItem.isToday && !isSelected && (
                    <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-amber-500" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer / Today Quick Button */}
      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
        <button
          type="button"
          onClick={handleJumpToToday}
          className="text-[11px] font-bold text-[#0ea5e9] hover:text-[#0284c7] flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-sky-50 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Hari Ini</span>
        </button>
        <button
          type="button"
          onClick={onClose}
          className="text-[11px] font-semibold text-slate-400 hover:text-slate-700 px-2 py-1 cursor-pointer"
        >
          Tutup
        </button>
      </div>
    </div>
  );
};
