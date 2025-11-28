import React from 'react';
import { ProductionPlan } from '../types';
import { CopyButton } from './CopyButton';

interface PartAProps {
  plan: ProductionPlan;
}

export const PartA: React.FC<PartAProps> = ({ plan }) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">🎙️</span>
        <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wide">Part A: The Production Plan</h2>
      </div>

      {/* Voice Model Casting Card */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h3 className="font-semibold text-slate-800">Voice Model Casting</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <p className="text-xs font-semibold text-slate-400 uppercase mb-1">Recommended Model</p>
            <div className="font-medium text-slate-900">{plan.modelName}</div>
          </div>
          <div className="md:col-span-2">
            <p className="text-xs font-semibold text-slate-400 uppercase mb-1">Justification</p>
            <p className="text-slate-600 text-sm leading-relaxed">{plan.justification}</p>
          </div>
        </div>
      </div>

      {/* Style Instruction Card */}
      <div className="bg-slate-50 rounded-lg border border-slate-200 shadow-sm p-5">
        <div className="flex justify-between items-start mb-2">
           <h3 className="text-sm font-semibold text-slate-800">Global Style Instruction</h3>
           <CopyButton textToCopy={plan.styleInstruction} />
        </div>
        <div className="bg-slate-100 rounded border border-slate-200 p-3 font-mono text-sm text-slate-700">
          {plan.styleInstruction}
        </div>
      </div>
    </div>
  );
};
