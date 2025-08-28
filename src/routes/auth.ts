import { Router, Request, Response } from 'express';
import { userService } from '../services/firebase';
import { authenticateUser, requireRole } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';
import { Timestamp } from 'firebase-admin/firestore';
import JWTService from '../services/jwtService';
import EmailService from '../services/emailService';

const router = Router();

// ==================== SIGNUP FLOW ====================

// Step 1: Initiate signup - send OTP
router.post('/signup/initiate', async (req: Request, res: Response) => {
  try {
    const { email, displayName } = req.body;

    // Validate required fields
    if (!email || !displayName) {
      throw createError('Email and display name are required', 400);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw createError('Invalid email format', 400);
    }

    // Check if user already exists
    const existingUser = await userService.getByEmail(email);
    if (existingUser) {
      throw createError('User already exists', 409);
    }

    // Generate OTP
    const otp = JWTService.generateOTP();
    const otpExpiresAt = Timestamp.fromDate(new Date(Date.now() + 10 * 60 * 1000)); // 10 minutes

    // Create user with pending verification
    const userId = await userService.create({
      email,
      displayName,
      role: 'user',
      isActive: false,
      lastLoginAt: Timestamp.now(),
      subscriptionPlan: 'free',
      apiRequestsCount: 0,
      apiRequestsLimit: 1000,
      isEmailVerified: false,
      emailVerificationOTP: otp,
      emailVerificationExpiresAt: otpExpiresAt,
      failedLoginAttempts: 0
    });

    // Send OTP email
    const emailSent = await EmailService.sendSignupOTP(email, otp);
    if (!emailSent) {
      // If email fails, delete the user and return error
      await userService.delete(userId);
      throw createError('Failed to send verification email', 500);
    }

    return res.status(200).json({
      success: true,
      data: {
        message: 'Verification OTP sent to your email',
        userId,
        email
      }
    });
  } catch (error: any) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        error: error.message
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Failed to initiate signup'
      });
    }
  }
});

// Step 2: Verify email with OTP
router.post('/signup/verify-email', async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      throw createError('Email and OTP are required', 400);
    }

    // Find user by email
    const user = await userService.getByEmail(email);
    if (!user) {
      throw createError('User not found', 404);
    }

    if (user.isEmailVerified) {
      throw createError('Email already verified', 400);
    }

    // Verify OTP
    if (user.emailVerificationOTP !== otp) {
      throw createError('Invalid OTP', 400);
    }

    // Check if OTP is expired
    if (user.emailVerificationExpiresAt && user.emailVerificationExpiresAt.toDate() < new Date()) {
      throw createError('OTP has expired', 400);
    }

    // Mark email as verified and clear OTP
    await userService.update(user.id!, {
      isEmailVerified: true,
      emailVerificationOTP: undefined,
      emailVerificationExpiresAt: undefined
    });

    // Send success email
    await EmailService.sendEmailVerified(email);

    return res.status(200).json({
      success: true,
      data: {
        message: 'Email verified successfully. You can now set your password.',
        userId: user.id,
        email
      }
    });
  } catch (error: any) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        error: error.message
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Failed to verify email'
      });
    }
  }
});

// Step 3: Set password after email verification
router.post('/signup/set-password', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw createError('Email and password are required', 400);
    }

    if (password.length < 8) {
      throw createError('Password must be at least 8 characters long', 400);
    }

    // Find user by email
    const user = await userService.getByEmail(email);
    if (!user) {
      throw createError('User not found', 404);
    }

    if (!user.isEmailVerified) {
      throw createError('Email must be verified before setting password', 403);
    }

    if (user.password) {
      throw createError('Password already set', 400);
    }

    // Hash password
    const hashedPassword = await JWTService.hashPassword(password);

    // Update user with password and activate account
    await userService.update(user.id!, {
      password: hashedPassword,
      isActive: true
    });

    // Send success email
    await EmailService.sendPasswordSet(email);

    return res.status(200).json({
      success: true,
      data: {
        message: 'Password set successfully. You can now log in.',
        userId: user.id,
        email
      }
    });
  } catch (error: any) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        error: error.message
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Failed to set password'
      });
    }
  }
});

// ==================== LOGIN FLOW ====================

// Step 1: Login with email and password
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw createError('Email and password are required', 400);
    }

    // Find user by email
    const user = await userService.getByEmail(email);
    if (!user) {
      throw createError('Invalid credentials', 401);
    }

    if (!user.isActive) {
      throw createError('Account is inactive', 403);
    }

    if (!user.isEmailVerified) {
      throw createError('Email must be verified before login', 403);
    }

    if (!user.password) {
      throw createError('Password not set. Please complete your signup.', 403);
    }

    // Check if account is locked
    if (user.accountLockedUntil && user.accountLockedUntil.toDate() > new Date()) {
      throw createError('Account is temporarily locked due to multiple failed attempts', 423);
    }

    // Verify password
    const isPasswordValid = await JWTService.comparePassword(password, user.password);
    if (!isPasswordValid) {
      // Increment failed login attempts
      const newFailedAttempts = (user.failedLoginAttempts || 0) + 1;
      const updateData: any = {
        failedLoginAttempts: newFailedAttempts,
        lastFailedLoginAt: Timestamp.now()
      };

      // Lock account after 5 failed attempts for 30 minutes
      if (newFailedAttempts >= 5) {
        updateData.accountLockedUntil = Timestamp.fromDate(new Date(Date.now() + 30 * 60 * 1000));
      }

      await userService.update(user.id!, updateData);

      throw createError('Invalid credentials', 401);
    }

    // Reset failed login attempts on successful login
    if (user.failedLoginAttempts > 0) {
      await userService.update(user.id!, {
        failedLoginAttempts: 0,
        lastFailedLoginAt: undefined,
        accountLockedUntil: undefined
      });
    }

    // Generate login OTP
    const loginOTP = JWTService.generateOTP();
    const otpExpiresAt = Timestamp.fromDate(new Date(Date.now() + 10 * 60 * 1000)); // 10 minutes

    // Store login OTP
    await userService.update(user.id!, {
      loginOTP,
      loginOTPExpiresAt: otpExpiresAt
    });

    // Send login OTP email
    const emailSent = await EmailService.sendLoginOTP(email, loginOTP);
    if (!emailSent) {
      throw createError('Failed to send login OTP', 500);
    }

    return res.status(200).json({
      success: true,
      data: {
        message: 'Login OTP sent to your email',
        userId: user.id,
        email,
        requiresOTP: true
      }
    });
  } catch (error: any) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        error: error.message
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Failed to process login'
      });
    }
  }
});

// Step 2: Complete login with OTP
router.post('/login/verify-otp', async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      throw createError('Email and OTP are required', 400);
    }

    // Find user by email
    const user = await userService.getByEmail(email);
    if (!user) {
      throw createError('User not found', 404);
    }

    if (!user.isActive) {
      throw createError('Account is inactive', 403);
    }

    // Verify login OTP
    if (user.loginOTP !== otp) {
      throw createError('Invalid OTP', 400);
    }

    // Check if OTP is expired
    if (user.loginOTPExpiresAt && user.loginOTPExpiresAt.toDate() < new Date()) {
      throw createError('OTP has expired', 400);
    }

    // Clear OTP after successful verification
    await userService.update(user.id!, {
      loginOTP: undefined,
      loginOTPExpiresAt: undefined,
      lastLoginAt: Timestamp.now()
    });

    // Generate JWT token
    const token = JWTService.generateToken({
      userId: user.id!,
      email: user.email,
      role: user.role,
      subscriptionPlan: user.subscriptionPlan
    });

    return res.status(200).json({
      success: true,
      data: {
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          role: user.role,
          subscriptionPlan: user.subscriptionPlan
        }
      }
    });
  } catch (error: any) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        error: error.message
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Failed to verify OTP'
      });
    }
  }
});

// ==================== PASSWORD RESET FLOW ====================

// Step 1: Request password reset - send OTP
router.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw createError('Email is required', 400);
    }

    // Find user by email
    const user = await userService.getByEmail(email);
    if (!user) {
      // Don't reveal if user exists or not for security
      return res.status(200).json({
        success: true,
        data: {
          message: 'If an account with this email exists, a password reset OTP has been sent'
        }
      });
    }

    if (!user.isActive) {
      throw createError('Account is inactive', 403);
    }

    // Generate password reset OTP
    const resetOTP = JWTService.generateOTP();
    const otpExpiresAt = Timestamp.fromDate(new Date(Date.now() + 10 * 60 * 1000)); // 10 minutes

    // Store password reset OTP
    await userService.update(user.id!, {
      passwordResetOTP: resetOTP,
      passwordResetExpiresAt: otpExpiresAt
    });

    // Send password reset OTP email
    const emailSent = await EmailService.sendPasswordResetOTP(email, resetOTP);
    if (!emailSent) {
      throw createError('Failed to send password reset OTP', 500);
    }

    return res.status(200).json({
      success: true,
      data: {
        message: 'Password reset OTP sent to your email'
      }
    });
  } catch (error: any) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        error: error.message
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Failed to process password reset request'
      });
    }
  }
});

// Step 2: Verify password reset OTP
router.post('/reset-password/verify-otp', async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      throw createError('Email and OTP are required', 400);
    }

    // Find user by email
    const user = await userService.getByEmail(email);
    if (!user) {
      throw createError('User not found', 404);
    }

    if (!user.isActive) {
      throw createError('Account is inactive', 403);
    }

    // Verify password reset OTP
    if (user.passwordResetOTP !== otp) {
      throw createError('Invalid OTP', 400);
    }

    // Check if OTP is expired
    if (user.passwordResetExpiresAt && user.passwordResetExpiresAt.toDate() < new Date()) {
      throw createError('OTP has expired', 400);
    }

    // Generate temporary token for password reset
    const resetToken = JWTService.generateOTPToken(email, 'password-reset');

    return res.status(200).json({
      success: true,
      data: {
        message: 'OTP verified successfully. You can now set a new password.',
        resetToken
      }
    });
  } catch (error: any) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        error: error.message
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Failed to verify OTP'
      });
    }
  }
});

// Step 3: Set new password with reset token
router.post('/reset-password/set-new-password', async (req: Request, res: Response) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      throw createError('Reset token and new password are required', 400);
    }

    if (newPassword.length < 8) {
      throw createError('Password must be at least 8 characters long', 400);
    }

    // Verify reset token
    const decoded = JWTService.verifyOTPToken(resetToken);
    if (!decoded || decoded.purpose !== 'password-reset') {
      throw createError('Invalid or expired reset token', 400);
    }

    // Find user by email
    const user = await userService.getByEmail(decoded.email);
    if (!user) {
      throw createError('User not found', 404);
    }

    if (!user.isActive) {
      throw createError('Account is inactive', 403);
    }

    // Hash new password
    const hashedPassword = await JWTService.hashPassword(newPassword);

    // Update password and clear reset OTP
    await userService.update(user.id!, {
      password: hashedPassword,
      passwordResetOTP: undefined,
      passwordResetExpiresAt: undefined
    });

    // Send success email
    await EmailService.sendPasswordSet(decoded.email);

    return res.status(200).json({
      success: true,
      data: {
        message: 'Password reset successfully. You can now log in with your new password.'
      }
    });
  } catch (error: any) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        error: error.message
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Failed to reset password'
      });
    }
  }
});

// ==================== OTHER AUTH ROUTES ====================

// Get user profile (authenticated)
router.get('/profile', authenticateUser, async (req: Request, res: Response) => {
  try {
    const user = await userService.getById(req.user!.userId);
    
    if (!user) {
      throw createError('User not found', 404);
    }

    return res.status(200).json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        role: user.role,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt.toDate().toISOString(),
        subscriptionPlan: user.subscriptionPlan,
        apiRequestsCount: user.apiRequestsCount,
        apiRequestsLimit: user.apiRequestsLimit,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (error: any) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        error: error.message
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch user profile'
      });
    }
  }
});

// Update user profile (authenticated)
router.put('/profile', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { displayName, photoURL } = req.body;
    
    // Only allow updating certain fields
    const updateData: any = {};
    if (displayName) updateData.displayName = displayName;
    if (photoURL) updateData.photoURL = photoURL;

    await userService.update(req.user!.userId, updateData);

    return res.status(200).json({
      success: true,
      data: { message: 'Profile updated successfully' }
    });
  } catch (error: any) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        error: error.message
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Failed to update profile'
      });
    }
  }
});

// Logout (authenticated)
router.post('/logout', authenticateUser, async (req: Request, res: Response) => {
  try {
    // In a real application, you might want to add the token to a blacklist
    // For now, we'll just return success since JWT tokens are stateless
    
    return res.status(200).json({
      success: true,
      data: { message: 'Logged out successfully' }
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: 'Failed to logout'
    });
  }
});

// Refresh token (authenticated)
router.post('/refresh-token', authenticateUser, async (req: Request, res: Response) => {
  try {
    const user = await userService.getById(req.user!.userId);
    
    if (!user || !user.isActive) {
      throw createError('User not found or inactive', 401);
    }

    // Generate new token
    const newToken = JWTService.generateToken({
      userId: user.id!,
      email: user.email,
      role: user.role,
      subscriptionPlan: user.subscriptionPlan
    });

    return res.status(200).json({
      success: true,
      data: {
        message: 'Token refreshed successfully',
        token: newToken
      }
    });
  } catch (error: any) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        error: error.message
      });
    } else {
      return res.status(500).json({
        success: false,
        error: 'Failed to refresh token'
      });
    }
  }
});

// Admin routes for user management
router.get('/users', 
  authenticateUser, 
  requireRole(['admin']),
  async (req: Request, res: Response) => {
    try {
      const { role, subscriptionPlan, limit = 50, page = 1 } = req.query;
      
      let constraints: any[] = [];
      
      if (role) {
        constraints.push({ type: 'where', field: 'role', op: '==', value: role });
      }
      
      if (subscriptionPlan) {
        constraints.push({ type: 'where', field: 'subscriptionPlan', op: '==', value: subscriptionPlan });
      }

      const users = await userService.getAll(constraints);
      
      // Simple pagination
      const pageSize = Number(limit);
      const currentPage = Number(page);
      const startIndex = (currentPage - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedUsers = users.slice(startIndex, pageSize);

      const response = {
        success: true,
        data: {
          users: paginatedUsers.map(user => ({
            id: user.id,
            email: user.email,
            displayName: user.displayName,
            role: user.role,
            isActive: user.isActive,
            lastLoginAt: user.lastLoginAt.toDate().toISOString(),
            subscriptionPlan: user.subscriptionPlan,
            apiRequestsCount: user.apiRequestsCount,
            apiRequestsLimit: user.apiRequestsLimit,
            isEmailVerified: user.isEmailVerified
          })),
          pagination: {
            currentPage,
            totalPages: Math.ceil(users.length / pageSize),
            totalUsers: users.length,
            hasNextPage: endIndex < users.length,
            hasPrevPage: currentPage > 1
          }
        }
      };

      return res.status(200).json(response);
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch users'
      });
    }
  }
);

export { router as authRouter };
