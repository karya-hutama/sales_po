import React, { useState } from 'react';
import { Search, ChevronDown, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

export const SearchableSelect = ({ 
  options, 
  value, 
  onChange, 
  placeholder, 
  label,
  isLoading = false
}: { 
  options: { value: string, label: string }[], 
  value: string, 
  onChange: (val: string) => void, 
  placeholder: string,
  label?: string,
  isLoading?: boolean
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  
  const filtered = options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()));
  const selected = options.find(o => o.value === value);

  return (
    <div className="relative space-y-2">
      {label && <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{label}</label>}
      <div 
        onClick={() => !isLoading && setIsOpen(!isOpen)}
        className={cn(
          "relative w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium cursor-pointer flex justify-between items-center transition-all",
          isOpen ? "ring-4 ring-indigo-50 border-indigo-400 bg-white" : "hover:border-indigo-200"
        )}
      >
        <span className={cn("transition-colors", !selected ? "text-gray-400" : "text-gray-900")}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown className={cn("w-5 h-5 text-gray-400 transition-transform duration-200", isOpen && "rotate-180")} />
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-[60]" onClick={() => setIsOpen(false)} />
            <motion.div 
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              className="absolute z-[70] w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden focus-within:ring-0"
            >
              <div className="p-3 border-b border-gray-50 flex items-center gap-2 bg-gray-50/50">
                <Search className="w-4 h-4 text-gray-400" />
                <input 
                  autoFocus
                  type="text" 
                  className="bg-transparent text-sm w-full outline-none font-medium placeholder:text-gray-300" 
                  placeholder="Search and filter..." 
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  onClick={e => e.stopPropagation()}
                />
              </div>
              <div className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-100 p-1">
                {filtered.length > 0 ? filtered.map(opt => (
                  <div 
                    key={opt.value}
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                      setSearch('');
                    }}
                    className={cn(
                      "p-3.5 text-sm font-bold cursor-pointer transition-all rounded-xl m-1 flex items-center justify-between group",
                      opt.value === value 
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" 
                        : "hover:bg-indigo-50 text-gray-600 hover:text-indigo-700"
                    )}
                  >
                    <span>{opt.label}</span>
                    {opt.value === value && <CheckCircle2 className="w-4 h-4 ml-2" />}
                  </div>
                )) : (
                  <div className="p-10 text-center flex flex-col items-center justify-center gap-3">
                    <Search className="w-8 h-8 text-gray-100" />
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest italic">No data match found</p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
