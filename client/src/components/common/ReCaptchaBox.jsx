import React, { useState, useEffect, useRef } from "react";
import { Check, ShieldCheck, RefreshCw } from "lucide-react";

/**
 * Google reCAPTCHA "I'm not a robot" Checkbox Box
 * Supports both Google reCAPTCHA script widget & fallback interactive checkbox
 */
const ReCaptchaBox = ({ checked, onChange, error }) => {
  const [verifying, setVerifying] = useState(false);
  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || "";
  const widgetRef = useRef(null);
  const [useOfficialWidget, setUseOfficialWidget] = useState(false);

  useEffect(() => {
    // If a valid siteKey is present and grecaptcha v2 is loaded, render official widget
    if (siteKey && siteKey.trim() !== "" && window.grecaptcha && window.grecaptcha.render && widgetRef.current) {
      try {
        setUseOfficialWidget(true);
        window.grecaptcha.render(widgetRef.current, {
          sitekey: siteKey,
          callback: (token) => {
            onChange(true, token);
          },
          'expired-callback': () => {
            onChange(false, null);
          },
          'error-callback': () => {
            onChange(false, null);
          },
          theme: 'dark',
        });
      } catch (err) {
        console.warn("Could not render official reCAPTCHA widget, using interactive fallback:", err);
        setUseOfficialWidget(false);
      }
    }
  }, [siteKey]);

  const handleCheckboxClick = () => {
    if (checked) return;

    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      onChange(true, "dev_verified_token");
    }, 400);
  };

  return (
    <div className="space-y-1">
      <div
        className={`bg-slate-900/90 border rounded-xl p-3.5 flex items-center justify-between shadow-md transition-all duration-200 ${
          error
            ? "border-red-500/80 bg-red-500/5 ring-1 ring-red-500/30"
            : checked
            ? "border-emerald-500/50 bg-slate-900"
            : "border-slate-700/70 hover:border-slate-600"
        }`}
      >
        {/* If official widget is rendered */}
        {useOfficialWidget ? (
          <div ref={widgetRef}></div>
        ) : (
          /* Interactive reCAPTCHA Checkbox Box */
          <>
            <div
              onClick={handleCheckboxClick}
              className="flex items-center space-x-3 cursor-pointer select-none group"
            >
              <div
                className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all duration-200 shadow-inner ${
                  checked
                    ? "bg-emerald-500 border-emerald-500 text-white scale-105"
                    : verifying
                    ? "border-blue-400 bg-blue-500/10"
                    : "border-slate-500 group-hover:border-slate-400 bg-slate-800/80"
                }`}
              >
                {verifying ? (
                  <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />
                ) : checked ? (
                  <Check className="w-5 h-5 text-slate-950 stroke-[3]" />
                ) : null}
              </div>
              <span className="text-sm font-medium text-slate-200 tracking-wide group-hover:text-white transition-colors">
                I'm not a robot
              </span>
            </div>

            {/* Google reCAPTCHA Logo Branding */}
            <div className="flex flex-col items-end justify-center pl-3 border-l border-slate-800">
              <div className="flex items-center space-x-1 text-slate-400">
                <ShieldCheck className="w-5 h-5 text-blue-400" />
                <span className="text-[10px] font-bold tracking-wider uppercase text-slate-300">reCAPTCHA</span>
              </div>
              <div className="flex items-center space-x-1.5 text-[9px] text-slate-500 mt-0.5">
                <a
                  href="https://www.google.com/intl/en/policies/privacy/"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline hover:text-slate-400"
                >
                  Privacy
                </a>
                <span>•</span>
                <a
                  href="https://www.google.com/intl/en/policies/terms/"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline hover:text-slate-400"
                >
                  Terms
                </a>
              </div>
            </div>
          </>
        )}
      </div>

      {error && (
        <p className="text-red-400 text-xs flex items-center pt-0.5 pl-1">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400 mr-1.5 inline-block"></span>
          {error}
        </p>
      )}
    </div>
  );
};

export default ReCaptchaBox;
