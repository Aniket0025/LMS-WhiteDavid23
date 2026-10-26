import jwt from 'jsonwebtoken';
import User from '../model/user.model.js';

export const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '') || req.cookies?.token || req.query?.token;
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access token is required' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_TOKEN);
    // Accept both 'userId' and 'id' for compatibility
    const userId = decoded.userId || decoded.id;
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token payload' 
      });
    }
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Check if token is about to expire (within 7 days)
    const tokenExp = decoded.exp * 1000; // Convert to milliseconds
    const now = Date.now();
    const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
    
    // Only set refresh header if token is actually about to expire
    if (tokenExp - now < sevenDaysInMs && tokenExp > now) {
      // Token is about to expire but still valid, set a header to indicate refresh needed
      res.set('X-Token-Refresh-Required', 'true');
    }
    
    req.user = { userId: user._id, role: user.role };
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    }
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid token' 
    });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    const userRole = req.user.role;
    // Admins have access to all protected endpoints; Educators have access to educator and student resources
    const isAuthorized =
      roles.includes(userRole) ||
      userRole === 'admin' ||
      (roles.includes('educator') && (userRole === 'educator' || userRole === 'admin'));

    if (!isAuthorized) {
      return res.status(403).json({ 
        success: false, 
        message: `Access denied. Required role: ${roles.join(' or ')}` 
      });
    }

    next();
  };
};