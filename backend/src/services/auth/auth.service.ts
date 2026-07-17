import bcrypt from "bcryptjs";
import jwt, {
  SignOptions,
} from "jsonwebtoken";

import User from "../../models/user";

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

class AuthService {
  /**
   * Generate a JWT for an authenticated user.
   */
  private generateToken(
    userId: string,
    role: string
  ): string {
    const secret =
      process.env.JWT_SECRET;

    if (!secret) {
      throw new Error(
        "JWT_SECRET is not configured"
      );
    }

    const expiresIn =
      (process.env.JWT_EXPIRES_IN ||
        "7d") as SignOptions["expiresIn"];

    return jwt.sign(
      {
        userId,
        role,
      },
      secret,
      {
        expiresIn,
      }
    );
  }

  /**
   * Register a new customer.
   */
  async register(
    input: RegisterInput
  ) {
    const name =
      input.name.trim();

    const email =
      input.email
        .trim()
        .toLowerCase();

    const password =
      input.password;

    /**
     * Basic validation.
     */
    if (!name) {
      throw new Error(
        "Name is required"
      );
    }

    if (!email) {
      throw new Error(
        "Email is required"
      );
    }

    if (
      !password ||
      password.length < 8
    ) {
      throw new Error(
        "Password must be at least 8 characters"
      );
    }

    /**
     * Make sure email isn't
     * already registered.
     */
    const existingUser =
      await User.findOne({
        email,
      });

    if (existingUser) {
      throw new Error(
        "An account with this email already exists"
      );
    }

    /**
     * Hash the password.
     */
    const passwordHash =
      await bcrypt.hash(
        password,
        12
      );

    /**
     * IMPORTANT:
     *
     * Public registration always
     * creates USER accounts.
     *
     * Never accept role from req.body.
     */
    const user =
      await User.create({
        name,
        email,
        passwordHash,
        role: "USER",
        isActive: true,
      });

    /**
     * Generate login token.
     */
    const token =
      this.generateToken(
        user._id.toString(),
        user.role
      );

    return {
      user: {
        id:
          user._id.toString(),

        name:
          user.name,

        email:
          user.email,

        role:
          user.role,

        isActive:
          user.isActive,
      },

      token,
    };
  }

  /**
   * Login an existing user.
   */
  async login(
    input: LoginInput
  ) {
    const email =
      input.email
        .trim()
        .toLowerCase();

    const password =
      input.password;

    if (
      !email ||
      !password
    ) {
      throw new Error(
        "Email and password are required"
      );
    }

    /**
     * Find user.
     */
    const user =
      await User.findOne({
        email,
      });

    /**
     * Keep the error generic.
     *
     * We don't want to reveal whether
     * a particular email exists.
     */
    if (!user) {
      throw new Error(
        "Invalid email or password"
      );
    }

    /**
     * Check account status.
     */
    if (!user.isActive) {
      throw new Error(
        "Your account has been disabled"
      );
    }

    /**
     * Compare plain password
     * against stored hash.
     */
    const passwordMatches =
      await bcrypt.compare(
        password,
        user.passwordHash
      );

    if (!passwordMatches) {
      throw new Error(
        "Invalid email or password"
      );
    }

    /**
     * Generate new JWT.
     */
    const token =
      this.generateToken(
        user._id.toString(),
        user.role
      );

    return {
      user: {
        id:
          user._id.toString(),

        name:
          user.name,

        email:
          user.email,

        role:
          user.role,

        isActive:
          user.isActive,
      },

      token,
    };
  }
}

export default new AuthService();