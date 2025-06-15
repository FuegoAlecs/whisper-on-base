// No useEffect, useState needed if chatHistory comes from props
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, MessageSquareText, X } from "lucide-react";

// CHAT_HISTORY_KEY removed

interface ConversationSummary {
  id: string;
  title: string;
  timestamp: number;
}

// StoredConversation interface removed

interface SidebarProps {
  onClose: () => void;
  chatHistory: ConversationSummary[]; // Expect summarized history from props
  onSelectChat: (conversationId: string) => void; // New prop for callback
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

// chatHistory state and useEffect for loading from localStorage are removed
const Sidebar = ({ onClose, chatHistory, onSelectChat }: SidebarProps) => {
  // The chatHistory prop is used directly for rendering
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
          {chatHistory && chatHistory.length > 0 ? ( // Check props.chatHistory
            chatHistory.map((convSummary) => (
              <Card
                key={convSummary.id}
                onClick={() => onSelectChat(convSummary.id)} // Use onSelectChat prop
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
