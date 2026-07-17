export type Role = "user" | "assistant";

export interface Message {
  id: string;
  role: Role;
  content: string;
  /** ISO timestamp */
  timestamp: string;
  /** Optional status to render pending states */
  status?: "sending" | "sent" | "error";
}

export interface SuggestedQuestion {
  id: string;
  text: string;
  icon?: string;
}

export type Theme = "light" | "dark";

export type ChatStatus = "idle" | "thinking" | "error";
