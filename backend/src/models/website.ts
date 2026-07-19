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

/**
 * Per-website branding sent to the widget.
 *
 * `primaryColor` and `surfaceColor` are required (with sensible defaults
 * applied at the schema level so legacy documents pick them up
 * automatically — see the `default` block below).
 *
 * `logoUrl` / `logoPublicId` are optional. The URL is the Cloudinary
 * secure_url returned by the completion endpoint, and `logoPublicId`
 * is stored solely so the server can issue a destroy() call when the
 * customer removes (or replaces) the logo.
 */
export interface IWebsiteAppearance {
  primaryColor: string;
  surfaceColor: string;
  logoUrl?: string;
  logoPublicId?: string;
}

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
  lastIndexingError?: string;

  appearance: IWebsiteAppearance;
}

/**
 * Default brand colors used when:
 *
 *  - A customer hasn't customized the widget yet.
 *  - Older documents (predating this field) are read into the API
 *    surface — Mongoose applies subdocument `default` factories for us.
 */
export const DEFAULT_APPEARANCE = {
  primaryColor: "#2563EB",
  surfaceColor: "#FFFFFF",
} as const satisfies Pick<
  IWebsiteAppearance,
  "primaryColor" | "surfaceColor"
>;

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
      lastIndexingError: {
        type: String,
        trim: true,
      },

      /**
       * Widget appearance (brand colors + optional logo).
       *
       * `default` ensures every persisted document has the structure the
       * widget expects — including legacy docs created before this field
       * existed (Mongoose applies the default on read queries that include
       * the path, and on save).
       */
      appearance: {
        type: {
          primaryColor: {
            type: String,
            required: true,
            default:
              DEFAULT_APPEARANCE.primaryColor,
          },
          surfaceColor: {
            type: String,
            required: true,
            default:
              DEFAULT_APPEARANCE.surfaceColor,
          },
          logoUrl: {
            type: String,
            trim: true,
          },
          logoPublicId: {
            type: String,
            trim: true,
          },
        },
        required: true,
        default: () => ({
          primaryColor:
            DEFAULT_APPEARANCE.primaryColor,
          surfaceColor:
            DEFAULT_APPEARANCE.surfaceColor,
        }),
        _id: false,
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
