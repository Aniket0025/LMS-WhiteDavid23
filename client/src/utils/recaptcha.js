/**
 * Utility for Google reCAPTCHA v3 script loading and execution
 */

let scriptLoaded = false;
let scriptLoadingPromise = null;

/**
 * Dynamically load Google reCAPTCHA v3 script
 */
export const loadRecaptchaScript = (siteKey) => {
  if (scriptLoaded && window.grecaptcha) {
    return Promise.resolve(window.grecaptcha);
  }

  if (scriptLoadingPromise) {
    return scriptLoadingPromise;
  }

  scriptLoadingPromise = new Promise((resolve, reject) => {
    // Check if script element already exists
    const existingScript = document.querySelector(`script[src*="recaptcha/api.js"]`);
    if (existingScript) {
      if (window.grecaptcha) {
        scriptLoaded = true;
        resolve(window.grecaptcha);
        return;
      }
    }

    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(siteKey)}`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      if (window.grecaptcha) {
        scriptLoaded = true;
        resolve(window.grecaptcha);
      } else {
        reject(new Error("reCAPTCHA v3 script loaded but grecaptcha is unavailable"));
      }
    };

    script.onerror = (err) => {
      scriptLoadingPromise = null;
      reject(new Error("Failed to load Google reCAPTCHA v3 script"));
    };

    document.head.appendChild(script);
  });

  return scriptLoadingPromise;
};

/**
 * Execute reCAPTCHA v3 for a given action (e.g. 'login')
 * Returns the reCAPTCHA token, or null if key is not configured or execution fails.
 */
export const executeRecaptcha = async (action = "login") => {
  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || "";

  if (!siteKey || siteKey.trim() === "" || siteKey === "YOUR_RECAPTCHA_SITE_KEY") {
    console.warn("⚠️ Google reCAPTCHA v3: VITE_RECAPTCHA_SITE_KEY is not configured in .env. Skipping frontend reCAPTCHA token generation.");
    return null;
  }

  try {
    await loadRecaptchaScript(siteKey);

    return new Promise((resolve) => {
      if (!window.grecaptcha) {
        console.warn("⚠️ Google reCAPTCHA v3: grecaptcha object not available.");
        resolve(null);
        return;
      }

      window.grecaptcha.ready(async () => {
        try {
          const token = await window.grecaptcha.execute(siteKey, { action });
          resolve(token);
        } catch (err) {
          console.error("Error executing reCAPTCHA v3:", err);
          resolve(null);
        }
      });
    });
  } catch (error) {
    console.error("reCAPTCHA script load error:", error);
    return null;
  }
};
