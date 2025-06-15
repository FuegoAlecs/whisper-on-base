import { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, MessageSquareText, X } from "lucide-react"; // Using MessageSquareText for history icon

const CHAT_HISTORY_KEY = 'chatHistory';

interface ConversationSummary {
  id: string;
  title: string;
  timestamp: number;
}

// Interface for the full conversation structure stored in localStorage
interface StoredConversation {
  id: string;
  messages: Array<{ text: string; isUser: boolean; [key: string]: any }>; // Simplified message structure for summary
  timestamp: number;
  title?: string;
}

interface SidebarProps {
  onClose: () => void;
  requestLoadConversation: (conversationId: string) => void;
}

const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.round(diffMs / 60000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
  if (diffMins < 2880) return "Yesterday"; // Up to 2 days
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const Sidebar = ({ onClose, requestLoadConversation }: SidebarProps) => {
  const [chatHistory, setChatHistory] = useState<ConversationSummary[]>([]);

  useEffect(() => {
    const storedHistory = localStorage.getItem(CHAT_HISTORY_KEY);
    if (storedHistory) {
      try {
        const conversations: StoredConversation[] = JSON.parse(storedHistory);
        // Sort by timestamp descending (most recent first)
        conversations.sort((a, b) => b.timestamp - a.timestamp);
        setChatHistory(conversations.map(conv => ({
          id: conv.id,
          title: conv.title || (conv.messages[0]?.text.substring(0, 30) + (conv.messages[0]?.text.length > 30 ? '...' : '')) || 'Untitled Chat',
          timestamp: conv.timestamp,
        })));
      } catch (error) {
        console.error("Error parsing chat history from localStorage:", error);
        setChatHistory([]); // Clear history if parsing fails
      }
    }
    // TODO: Consider adding a listener for custom 'historyUpdated' event
    // window.addEventListener('historyUpdated', loadHistoryFromStorage);
    // return () => window.removeEventListener('historyUpdated', loadHistoryFromStorage);
  }, []); // Empty dependency array means this runs once on mount

  return (
    <div className="w-full h-full border-l border-sidebar-border bg-sidebar backdrop-blur-sm overflow-y-auto">
      <div className="p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4 lg:space-y-6">
        {/* Mobile Close Button & Title */}
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-semibold text-sidebar-foreground flex items-center">
            <MessageSquareText className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-sidebar-accent" />
            Chat History
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-sidebar-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent lg:hidden p-1.5 sm:p-2"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>

        {/* Chat History List */}
        <div className="space-y-2 sm:space-y-3">
          {chatHistory.length > 0 ? (
            chatHistory.map((convSummary) => (
              <Card
                key={convSummary.id}
                onClick={() => requestLoadConversation(convSummary.id)}
                className="bg-sidebar-accent/30 border-sidebar-border p-2 sm:p-3 lg:p-4 hover:bg-sidebar-accent/50 transition-colors cursor-pointer"
              >
                <div className="flex flex-col">
                  <span className="text-xs sm:text-sm font-medium text-sidebar-foreground truncate mb-1">
                    {convSummary.title}
                  </span>
                  <span className="text-xs text-sidebar-muted-foreground">
                    <Clock className="h-3 w-3 inline mr-1" /> {formatTimestamp(convSummary.timestamp)}
                  </span>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-8">
              <MessageSquareText className="h-12 w-12 text-sidebar-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-sidebar-muted-foreground">No chat history yet.</p>
              <p className="text-xs text-sidebar-muted-foreground/70 mt-1">Start a conversation to see it here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
