import {
  Schema,
  model,
  Document,
} from "mongoose";

export type UserRole =
  | "USER"
  | "ADMIN";

export interface IUser
  extends Document {
  name: string;

  email: string;

  passwordHash: string;

  role: UserRole;

  isActive: boolean;

  createdAt: Date;

  updatedAt: Date;
}

const userSchema =
  new Schema<IUser>(
    {
      name: {
        type: String,
        required: true,
        trim: true,
      },

      email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
      },

      passwordHash: {
        type: String,
        required: true,
      },

      role: {
        type: String,
        enum: [
          "USER",
          "ADMIN",
        ],
        default: "USER",
      },

      isActive: {
        type: Boolean,
        default: true,
      },
    },
    {
      timestamps: true,
    }
  );

const User =
  model<IUser>(
    "User",
    userSchema
  );

export default User;