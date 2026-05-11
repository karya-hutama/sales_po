import React from 'react';
import { AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

export const CustomModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  type = 'confirm' 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm?: () => void; 
  title: string; 
  message: string; 
  type?: 'confirm' | 'alert' 
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-md overflow-hidden"
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center",
              type === 'confirm' ? "bg-red-50 text-red-600" : "bg-indigo-50 text-indigo-600"
            )}>
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          </div>
          <p className="text-sm text-gray-500 leading-relaxed">{message}</p>
        </div>
        <div className="bg-gray-50 p-4 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-gray-400 hover:text-gray-600 uppercase tracking-widest transition-colors"
          >
            {type === 'confirm' ? 'Cancel' : 'Close'}
          </button>
          {type === 'confirm' && onConfirm && (
            <button 
              onClick={() => { onConfirm(); onClose(); }}
              className="px-6 py-2 bg-red-600 text-white rounded-lg text-xs font-bold uppercase tracking-widest shadow-lg shadow-red-100 hover:bg-red-700 transition-all"
            >
              Confirm / Delete
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
