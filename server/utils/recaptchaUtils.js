/**
 * Google reCAPTCHA v3 Server-Side Verification Utility
 */

/**
 * Verifies a Google reCAPTCHA v3 token against Google's siteverify endpoint.
 *
 * @param {string} token - The reCAPTCHA token generated on the client
 * @param {string} remoteIp - Optional client IP address
 * @param {string} expectedAction - Expected action name (default 'login')
 * @returns {Promise<{success: boolean, message?: string, score?: number, bypassed?: boolean}>}
 */
export const verifyRecaptchaToken = async (token, remoteIp = null, expectedAction = "login") => {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY || "";
  const minScore = parseFloat(process.env.RECAPTCHA_MIN_SCORE || "0.5");

  // Development / Unconfigured Fallback
  if (!secretKey || secretKey.trim() === "" || secretKey === "YOUR_RECAPTCHA_SECRET_KEY") {
    if (process.env.NODE_ENV !== "production") {
      console.log("ℹ️  [reCAPTCHA v3]: RECAPTCHA_SECRET_KEY is not configured in server/.env. Bypassing verification.");
    }
    return { success: true, bypassed: true, score: 1.0 };
  }

  if (!token) {
    return {
      success: false,
      message: "reCAPTCHA security verification token is missing. Please try again.",
    };
  }

  try {
    const params = new URLSearchParams();
    params.append("secret", secretKey);
    params.append("response", token);
    if (remoteIp) {
      params.append("remoteip", remoteIp);
    }

    const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const data = await response.json();

    if (!data.success) {
      const errorCodes = data["error-codes"] ? data["error-codes"].join(", ") : "Unknown error";
      console.warn(`⚠️ Google reCAPTCHA verification failed: ${errorCodes}`);
      return {
        success: false,
        message: "reCAPTCHA security verification failed. Please try logging in again.",
        errorCodes: data["error-codes"],
      };
    }

    // Check score threshold (v3 score is between 0.0 and 1.0)
    if (typeof data.score === "number" && data.score < minScore) {
      console.warn(`⚠️ Google reCAPTCHA score too low: ${data.score} (Required >= ${minScore})`);
      return {
        success: false,
        message: "Security risk score threshold not met. Automated request suspected.",
        score: data.score,
      };
    }

    // Optionally check action if returned
    if (data.action && expectedAction && data.action !== expectedAction) {
      console.warn(`⚠️ Google reCAPTCHA action mismatch: expected '${expectedAction}', got '${data.action}'`);
    }

    return {
      success: true,
      score: data.score,
      action: data.action,
    };
  } catch (error) {
    console.error("Error connecting to Google reCAPTCHA verification service:", error);
    // Return error or fail open depending on requirement; returning error ensures security enforcement
    return {
      success: false,
      message: "Failed to reach reCAPTCHA security verification server. Please try again.",
    };
  }
};
