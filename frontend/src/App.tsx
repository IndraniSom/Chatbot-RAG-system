import { useState } from "react";
import { ChatWindow } from "./components/ChatWindow";
import { FloatingChatButton } from "./components/FloatingChatButton";
import { EmptyState } from "./components/EmptyState";
import { useDarkMode } from "./hooks/useDarkMode";

/**
 * Hosts the demo page behind the embed so this preview demonstrates the widget
 * on a realistic background.
 */
export default function App() {
  const [open, setOpen] = useState(false);
  const [theme, toggleTheme] = useDarkMode();

  return (
    <div className="min-h-screen bg-ink-50 text-ink-900 dark:bg-ink-900 dark:text-ink-50">
      <EmptyState />
      <FloatingChatButton isOpen={open} onClick={() => setOpen((o) => !o)} />
      <ChatWindow
        open={open}
        onClose={() => setOpen(false)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    </div>
  );
}
