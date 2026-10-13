import React from 'react';
import { Compass, ShieldCheck, Info, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-panel border-t border-panel-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent-primary/20 text-accent-primary">
                <Compass className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                Route<span className="text-accent-primary">X</span> AI
              </span>
            </div>
            <p className="text-sm font-medium text-slate-300 italic">
              "Smarter Roads. Safer Journeys. Better Cities."
            </p>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
              Intelligent road intelligence and traffic management platform designed for smart city
              demonstration, incident lifecycle tracking, route comparison, and traffic pattern analytics.
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-accent-primary/10 text-accent-primary border border-accent-primary/30">
                Developed by Anil Biradar
              </span>
            </div>
          </div>

          {/* Data Integrity & Transparency */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Data Integrity</span>
            </h4>
            <ul className="text-xs text-slate-400 space-y-2 leading-relaxed">
              <li>• OpenStreetMap cartographic base tiles</li>
              <li>• Geometric road network comparison algorithms</li>
              <li>• Clear labeling of DEMO vs USER-REPORTED records</li>
              <li>• Moderated incident verification lifecycle</li>
            </ul>
          </div>

          {/* System Notices */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
              <Info className="w-4 h-4 text-sky-400" />
              <span>Transparency Notice</span>
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Demonstration traffic incidents are simulated for platform evaluation. Route travel times represent
              geometric routing models and do not claim unverified live GPS probe surveillance or direct emergency dispatch.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-panel-border/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} RouteX AI. All rights reserved.</p>
          <div className="flex items-center space-x-2">
            <span>Engineering Excellence & Smart Mobility</span>
            <span>•</span>
            <span className="text-slate-300 font-medium">Anil Biradar</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
