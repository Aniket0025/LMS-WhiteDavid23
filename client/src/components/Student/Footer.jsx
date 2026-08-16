import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-[#001f3f] to-black text-white py-6 relative overflow-hidden text-sm flex-shrink-0 border-t border-[#0a1128]">
      {/* Starry background */}
      <div className="absolute inset-0 starry-bg opacity-10 pointer-events-none"></div>

      <div className="container mx-auto px-4 relative z-10 text-center">
        <div className="font-bold text-xl mb-1 tracking-tight">
          whitedavid<span className="text-[#0074D9]">23</span>
        </div>
        <p className="text-[#94a3b8] text-xs mb-4 max-w-md mx-auto">
          Empowering learners worldwide with quality education and practical skills.
        </p>

        {/* Copyright */}
        <div className="border-t border-[#1e293b]/60 pt-4 text-[#94a3b8] text-xs">
          <p>© {new Date().getFullYear()} whitedavid23 Education Platform. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;