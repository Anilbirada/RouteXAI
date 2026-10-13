import React from 'react';
import {
  Compass,
  MapPin,
  AlertTriangle,
  GitBranch,
  BarChart3,
  Bell,
  ShieldCheck,
  ChevronRight,
  Activity,
  Layers,
  ArrowRight,
  Shield,
  Eye,
  CheckCircle,
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (tab: string) => void;
  onOpenReportModal: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, onOpenReportModal }) => {
  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-accent-secondary/20 via-accent-primary/20 to-transparent blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-panel-subtle/80 border border-panel-border shadow-sm">
            <span className="w-2 h-2 rounded-full bg-accent-primary animate-ping" />
            <span className="text-xs font-semibold text-slate-300">
              Next-Gen Smart Traffic Platform • Developed by Anil Biradar
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] max-w-4xl mx-auto">
            See Traffic Differently.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-primary via-sky-300 to-accent-secondary">
              Move More Intelligently.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Explore traffic conditions, understand road incidents, and discover data-driven insights through one intelligent traffic management platform.
          </p>

          <p className="text-sm font-semibold tracking-wide text-accent-primary uppercase font-mono">
            "Smarter Roads. Safer Journeys. Better Cities."
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
            <button
              onClick={() => onNavigate('dashboard')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-bold bg-accent-primary hover:bg-accent-hover text-black transition-all shadow-lg shadow-accent-primary/25 flex items-center justify-center space-x-2"
            >
              <span>Open Traffic Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('map')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-semibold bg-panel-subtle hover:bg-slate-800 text-white border border-panel-border transition-all flex items-center justify-center space-x-2"
            >
              <MapPin className="w-4 h-4 text-accent-primary" />
              <span>Explore Traffic Map</span>
            </button>
          </div>

          {/* Live Preview Card */}
          <div className="mt-12 relative max-w-5xl mx-auto rounded-2xl border border-panel-border bg-panel/70 p-3 shadow-2xl backdrop-blur-md">
            <div className="flex items-center justify-between px-3 py-2 border-b border-panel-border mb-3">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                <span className="text-xs font-mono text-slate-400 ml-2">routex.ai/ops-live-hud</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-purple-950 text-purple-300 border border-purple-800">
                DEMO DATA SIMULATION
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left p-2">
              <div
                onClick={() => onNavigate('map')}
                className="cursor-pointer p-4 rounded-xl bg-panel-subtle/70 border border-panel-border hover:border-accent-primary/50 transition-all space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">ACTIVE INCIDENTS</span>
                  <span className="p-1 rounded bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-bold">
                    8 LOGGED
                  </span>
                </div>
                <div className="text-2xl font-bold text-white group-hover:text-accent-primary transition-colors">
                  Urban Ring Road
                </div>
                <p className="text-xs text-slate-400">
                  Critical drain repair & multi-vehicle collision flagged. Tap to inspect pins on interactive map.
                </p>
              </div>

              <div
                onClick={() => onNavigate('routes')}
                className="cursor-pointer p-4 rounded-xl bg-panel-subtle/70 border border-panel-border hover:border-accent-primary/50 transition-all space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">SMART ROUTING</span>
                  <span className="p-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                    OPTIMIZED
                  </span>
                </div>
                <div className="text-2xl font-bold text-white group-hover:text-accent-primary transition-colors">
                  Route Comparison
                </div>
                <p className="text-xs text-slate-400">
                  Bypass delay by taking Ring Road corridor (12 mins saved vs clogged main boulevard).
                </p>
              </div>

              <div
                onClick={() => onNavigate('analytics')}
                className="cursor-pointer p-4 rounded-xl bg-panel-subtle/70 border border-panel-border hover:border-accent-primary/50 transition-all space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400">CORRIDOR INTELLIGENCE</span>
                  <span className="p-1 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[10px] font-bold">
                    AI AGGREGATED
                  </span>
                </div>
                <div className="text-2xl font-bold text-white group-hover:text-accent-primary transition-colors">
                  Spatial Trends
                </div>
                <p className="text-xs text-slate-400">
                  Roadworks represent 25% of traffic constraints. Export historical CSV summaries.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Core Intelligence Capabilities
          </h2>
          <p className="text-sm text-slate-400">
            Engineered from ground up with clear data provenance, modular APIs, and intuitive geospatial tools.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="p-6 rounded-2xl bg-panel border border-panel-border space-y-3 hover:border-accent-primary/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-accent-primary/10 text-accent-primary flex items-center justify-center">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">1. Interactive Traffic Map</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Explore dynamic OpenStreetMap tiles with filtered hazard pins, closure overlays, incident radius circles, and quick coordinate inspect panels.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-6 rounded-2xl bg-panel border border-panel-border space-y-3 hover:border-accent-primary/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-accent-secondary/15 text-accent-secondary flex items-center justify-center">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">2. Congestion Hotspot Detection</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Analyze dense clusters of traffic slowdowns, recurring waterlogging zones, and construction corridors to focus road patrol resources.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-6 rounded-2xl bg-panel border border-panel-border space-y-3 hover:border-accent-primary/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">3. Road Incident Lifecycle Management</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Complete workflow with user submissions, moderator review, audit timestamps, and clear status progression from Reported to Resolved.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="p-6 rounded-2xl bg-panel border border-panel-border space-y-3 hover:border-accent-primary/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <GitBranch className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">4. Smart Route Comparison</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Compare direct arterial corridors versus outer bypass alternatives with incident proximity collision detection and estimated travel durations.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="p-6 rounded-2xl bg-panel border border-panel-border space-y-3 hover:border-accent-primary/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">5. Traffic Analytics & Insights</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Real database aggregations by incident type, severity distributions, 7-day volume trends, explainable traffic insights, and CSV downloads.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="p-6 rounded-2xl bg-panel border border-panel-border space-y-3 hover:border-accent-primary/40 transition-all">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Bell className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">6. Smart Notifications & RBAC</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Role-based permissions distinguishing Public Commuters, Registered Users, Traffic Operators, and Administrators with broadcast alerts.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 md:p-12 rounded-3xl bg-panel border border-panel-border">
          <div className="text-center max-w-2xl mx-auto space-y-2 mb-10">
            <h3 className="text-xl sm:text-2xl font-bold text-white">How RouteX AI Works</h3>
            <p className="text-xs text-slate-400">
              A transparent 4-stage pipeline connecting ground incidents to commute decisions
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div className="p-4 rounded-xl bg-panel-subtle/50 border border-panel-border/60 space-y-2">
              <div className="w-8 h-8 rounded-full bg-accent-primary/20 text-accent-primary font-bold text-xs flex items-center justify-center mx-auto">
                01
              </div>
              <h4 className="text-sm font-bold text-white">Report & Ingest</h4>
              <p className="text-xs text-slate-400">
                Commuters and sensor feeds log road hazards with validated geo-coordinates.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-panel-subtle/50 border border-panel-border/60 space-y-2">
              <div className="w-8 h-8 rounded-full bg-accent-secondary/20 text-accent-secondary font-bold text-xs flex items-center justify-center mx-auto">
                02
              </div>
              <h4 className="text-sm font-bold text-white">Verify & Moderate</h4>
              <p className="text-xs text-slate-400">
                Traffic operations personnel verify severity and confirm or resolve reports.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-panel-subtle/50 border border-panel-border/60 space-y-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center mx-auto">
                03
              </div>
              <h4 className="text-sm font-bold text-white">Spatial Analysis</h4>
              <p className="text-xs text-slate-400">
                Routing algorithms calculate proximity buffers along candidate journey paths.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-panel-subtle/50 border border-panel-border/60 space-y-2">
              <div className="w-8 h-8 rounded-full bg-sky-500/20 text-sky-400 font-bold text-xs flex items-center justify-center mx-auto">
                04
              </div>
              <h4 className="text-sm font-bold text-white">Actionable Advisory</h4>
              <p className="text-xs text-slate-400">
                Commuters receive route comparisons with clear warnings and estimated travel times.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final Callout */}
      <section className="text-center max-w-4xl mx-auto px-4 sm:px-6 space-y-4">
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
          Better Traffic Decisions Start with Better Information.
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
          Explore the live interactive map, inspect active road disruptions, or test route comparison algorithms.
        </p>
        <div className="pt-2 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => onNavigate('map')}
            className="px-6 py-3 rounded-xl text-xs font-bold bg-accent-primary hover:bg-accent-hover text-black transition-all"
          >
            Launch Interactive Map
          </button>
          <button
            onClick={onOpenReportModal}
            className="px-6 py-3 rounded-xl text-xs font-bold bg-panel-subtle hover:bg-slate-800 text-white border border-panel-border transition-all"
          >
            Report Road Incident
          </button>
        </div>
      </section>
    </div>
  );
};
