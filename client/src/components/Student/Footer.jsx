import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ShieldCheck, Sparkles, Terminal, ArrowUpRight } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-slate-950 via-[#030712] to-black text-white relative overflow-hidden border-t border-slate-800/60 pt-16 pb-12">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[200px] bg-blue-600/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 mb-12">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-flex items-center space-x-2.5 group">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center">
                <img 
                  src="/login.png" 
                  alt="whitedavid23 Logo" 
                  className="w-full h-full object-contain scale-[2.4] group-hover:scale-[2.7] transition-transform duration-300"
                />
              </div>
              <span className="text-2xl font-black text-white tracking-tight">
                whitedavid<span className="text-blue-400">23</span>
              </span>
            </Link>
            
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-sm">
              Empowering developers and engineers worldwide with production-ready DevOps, 
              Cloud Architecture, and Machine Learning masterclasses.
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Platform Active & Fully Verified</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wide uppercase mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-400">
              <li>
                <Link to="/" className="hover:text-blue-400 transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/course" className="hover:text-blue-400 transition-colors">All Courses</Link>
              </li>
              <li>
                <Link to="/search" className="hover:text-blue-400 transition-colors">Search Tracks</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-blue-400 transition-colors">About whitedavid23</Link>
              </li>
            </ul>
          </div>

          {/* Student Hub */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wide uppercase mb-4">
              Learner Portal
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-400">
              <li>
                <Link to="/student/dashboard" className="hover:text-blue-400 transition-colors">Student Dashboard</Link>
              </li>
              <li>
                <Link to="/student/account" className="hover:text-blue-400 transition-colors">My Account</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-blue-400 transition-colors">Sign In</Link>
              </li>
              <li>
                <Link to="/forgot-password" className="hover:text-blue-400 transition-colors">Password Recovery</Link>
              </li>
            </ul>
          </div>

          {/* Educator Hub */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wide uppercase mb-4">
              Educator Portal
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-400">
              <li>
                <Link to="/educator" className="hover:text-blue-400 transition-colors">Instructor Studio</Link>
              </li>
              <li>
                <Link to="/educator/add-course" className="hover:text-blue-400 transition-colors">Create Course</Link>
              </li>
              <li>
                <Link to="/educator/analytics" className="hover:text-blue-400 transition-colors">Analytics & Sales</Link>
              </li>
              <li>
                <Link to="/educator/students" className="hover:text-blue-400 transition-colors">Manage Students</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Sub-Footer */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} whitedavid23 Education Platform. All rights reserved.</p>
          <div className="flex items-center space-x-6 text-slate-400">
            <span>DevOps & Machine Learning</span>
            <span>•</span>
            <span>Lifetime Access</span>
            <span>•</span>
            <span>Curated Curriculum</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;