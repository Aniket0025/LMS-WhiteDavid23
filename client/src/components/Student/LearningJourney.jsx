import React from 'react';
import { Compass, PlayCircle, FileCode, Trophy, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LearningJourney = () => {
  const navigate = useNavigate();

  const steps = [
    {
      step: '01',
      title: 'Select Your Track',
      description: 'Choose between Cloud & DevOps or Machine Learning & AI masterclasses tailored to current tech demands.',
      icon: Compass,
      gradient: 'from-blue-500 to-cyan-500',
      badge: 'Step 1'
    },
    {
      step: '02',
      title: 'Watch Chapter Modules',
      description: 'Stream high-definition lectures with instant chapter navigation, playback speed controls, and timestamp bookmarks.',
      icon: PlayCircle,
      gradient: 'from-indigo-500 to-purple-500',
      badge: 'Step 2'
    },
    {
      step: '03',
      title: 'Apply Real Code & Notes',
      description: 'Download lecture reference notes, follow along with production scripts, and build verifiable code repos.',
      icon: FileCode,
      gradient: 'from-emerald-500 to-teal-500',
      badge: 'Step 3'
    },
    {
      step: '04',
      title: 'Advance Your Career',
      description: 'Track your completion analytics, build job-ready confidence, and apply architectural patterns in real production.',
      icon: Trophy,
      gradient: 'from-amber-500 to-orange-500',
      badge: 'Step 4'
    }
  ];

  return (
    <section className="py-20 sm:py-28 bg-gradient-to-b from-slate-950 via-[#050b18] to-slate-950 border-t border-slate-800/40 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-purple-600/10 rounded-full blur-[130px] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10 max-w-7xl">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Structured Learning Path</span>
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
            How Your Learning Journey <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">Unfolds</span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            From initial enrollment to real-world deployment, our step-by-step methodology ensures measurable technical progress.
          </p>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="relative rounded-2xl bg-slate-900/70 backdrop-blur-xl border border-slate-800 hover:border-blue-500/40 p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1.5 group"
              >
                <div>
                  {/* Step Number & Icon Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.gradient} text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-3xl font-black text-slate-800 group-hover:text-slate-700 transition-colors font-mono">
                      {item.step}
                    </span>
                  </div>

                  <span className="text-[11px] font-bold text-blue-400 tracking-wider uppercase mb-1.5 block">
                    {item.badge}
                  </span>
                  <h3 className="text-lg font-bold text-white mb-2.5 group-hover:text-blue-300 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-4">
                    {item.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1 text-slate-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Hands-on
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">Phase {index + 1}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Fast-Track Banner */}
        <div className="mt-14 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-blue-900/20 via-slate-900 to-indigo-900/20 border border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="max-w-xl">
            <h4 className="text-base sm:text-lg font-bold text-white mb-1.5">
              Ready to begin your masterclass today?
            </h4>
            <p className="text-xs sm:text-sm text-slate-400">
              Get lifetime access to DevOps and Machine Learning curriculum, chapters, and resources.
            </p>
          </div>
          <button
            onClick={() => navigate('/course')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm transition-all shadow-lg shadow-blue-600/25 shrink-0"
          >
            <span>Explore All Masterclasses</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default LearningJourney;
