import { login, logout, register, refreshToken, sendRegistrationOTP, verifyOTPAndRegister, resendOTP, forgotPassword, verifyResetOTP, resetPassword } from "../controllers/auth.controllers.js";
import { authenticate,authorize } from "../middleware/authMiddleaare.js";
import express from 'express';

const authRouter = express.Router();

// OTP-based registration routes
authRouter.post('/send-registration-otp', sendRegistrationOTP);
authRouter.post('/verify-otp', verifyOTPAndRegister);
authRouter.post('/resend-otp', resendOTP);

// Original routes (keeping for backward compatibility)
authRouter.post('/register', register);
authRouter.post('/login',login);
authRouter.post('/logout',logout);
authRouter.post('/refresh-token', refreshToken);

// Password reset routes
authRouter.post('/forgot-password', forgotPassword);
authRouter.post('/verify-reset-otp', verifyResetOTP);
authRouter.post('/reset-password', resetPassword);

// the educator route 
authRouter.get('/educator/profile',authenticate,authorize('educator'));


export default authRouter;