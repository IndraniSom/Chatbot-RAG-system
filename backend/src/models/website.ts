import {
  Schema,
  model,
  Document,
  Types,
} from "mongoose";

export type WebsiteApprovalStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED";

export type WidgetStatus =
  | "NOT_INSTALLED"
  | "INSTALLED";

export type IndexingStatus =
  | "NOT_INDEXED"
  | "INDEXING"
  | "INDEXED"
  | "FAILED";

export interface IWebsite
  extends Document {
  websiteId: string;

  userId: Types.ObjectId;

  name: string;

  url: string;

  domain: string;

  allowedDomains: string[];

  status:
    WebsiteApprovalStatus;

  rejectionReason?: string;

  widgetStatus:
    WidgetStatus;

  indexingStatus:
    IndexingStatus;

  isActive: boolean;

  approvedBy?:
    Types.ObjectId;

  approvedAt?: Date;

  lastIndexedAt?: Date;

  createdAt: Date;

  updatedAt: Date;
}

const websiteSchema =
  new Schema<IWebsite>(
    {
      /**
       * Public ID used by widget
       * and Qdrant.
       *
       * Example:
       * ws_f82a7b93
       */
      websiteId: {
        type: String,
        required: true,
        unique: true,
        index: true,
      },

      /**
       * Customer who owns
       * this website.
       */
      userId: {
        type:
          Schema.Types.ObjectId,

        ref: "User",

        required: true,

        index: true,
      },

      name: {
        type: String,
        required: true,
        trim: true,
      },

      url: {
        type: String,
        required: true,
        trim: true,
      },

      /**
       * Normalized domain.
       *
       * Example:
       * runforsafefood.org
       */
      domain: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
      },

      /**
       * Domains allowed to
       * load this chatbot.
       */
      allowedDomains: {
        type: [String],

        default: [],
      },

      /**
       * Admin approval status.
       */
      status: {
        type: String,

        enum: [
          "PENDING",
          "APPROVED",
          "REJECTED",
        ],

        default:
          "PENDING",

        index: true,
      },

      rejectionReason: {
        type: String,
        trim: true,
      },

      /**
       * Whether Scrappy script
       * was successfully installed.
       */
      widgetStatus: {
        type: String,

        enum: [
          "NOT_INSTALLED",
          "INSTALLED",
        ],

        default:
          "NOT_INSTALLED",
      },

      /**
       * Website knowledge
       * indexing status.
       */
      indexingStatus: {
        type: String,

        enum: [
          "NOT_INDEXED",
          "INDEXING",
          "INDEXED",
          "FAILED",
        ],

        default:
          "NOT_INDEXED",
      },

      /**
       * Allows admin to disable
       * an approved chatbot.
       */
      isActive: {
        type: Boolean,
        default: false,
      },

      approvedBy: {
        type:
          Schema.Types.ObjectId,

        ref: "User",
      },

      approvedAt: {
        type: Date,
      },

      lastIndexedAt: {
        type: Date,
      },
    },
    {
      timestamps: true,
    }
  );

const Website =
  model<IWebsite>(
    "Website",
    websiteSchema
  );

export default Website;