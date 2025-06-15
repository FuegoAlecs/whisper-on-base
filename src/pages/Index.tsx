
import Header from "@/components/Header";
import ChatWindow from "@/components/ChatWindow";
// Import ConversationData if it's in ChatWindow.tsx and exported, or define below
// For now, assuming ChatWindow.tsx exports ConversationData and Message (or define them here)
import type { ConversationData as ImportedConversationData, Message as ImportedMessage } from "@/components/ChatWindow";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import { useState, useEffect } from "react"; // Added useEffect for potential future use (e.g. loading from localStorage on mount)

// Define types here if not imported or if there are slight differences
interface Message extends ImportedMessage {} // Use imported type
interface ConversationData extends ImportedConversationData {} // Use imported type


const Index = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sessionChatHistory, setSessionChatHistory] = useState<ConversationData[]>([]);
  const [activeConversation, setActiveConversation] = useState<{ id: string | null; messages: Message[] | null }>({ id: null, messages: null });

  // TODO: Could load initial sessionChatHistory from localStorage here if desired for persistence across browser refreshes
  // useEffect(() => {
  //   const storedHistory = localStorage.getItem('appSessionChatHistory');
  //   if (storedHistory) {
  //     setSessionChatHistory(JSON.parse(storedHistory));
  //   }
  // }, []);

  // TODO: Could save sessionChatHistory to localStorage whenever it changes
  // useEffect(() => {
  //   localStorage.setItem('appSessionChatHistory', JSON.stringify(sessionChatHistory));
  // }, [sessionChatHistory]);


  const handleSaveConversation = (conversation: ConversationData) => {
    setSessionChatHistory(prevHistory => {
      const existingIndex = prevHistory.findIndex(histConv => histConv.id === conversation.id);
      let newHistory;
      if (existingIndex !== -1) {
        newHistory = [...prevHistory];
        newHistory[existingIndex] = conversation;
      } else {
        newHistory = [...prevHistory, conversation];
      }
      // Sort by timestamp descending (most recent first)
      newHistory.sort((a, b) => b.timestamp - a.timestamp);
      return newHistory;
    });
    // Ensure the ChatWindow shows the just-saved conversation
    setActiveConversation({ id: conversation.id, messages: conversation.messages });
  };

  const handleLoadChatFromSidebar = (conversationId: string) => {
    const conversationToLoad = sessionChatHistory.find(conv => conv.id === conversationId);
    if (conversationToLoad) {
      setActiveConversation({ id: conversationToLoad.id, messages: conversationToLoad.messages });
      if (window.innerWidth < 1024) { // lg breakpoint
        setSidebarOpen(false);
      }
    }
  };

  const handleNewChat = () => {
    setActiveConversation({ id: null, messages: [] }); // Clear messages and ID for a new chat
    // Optionally, close sidebar on mobile when starting a new chat
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };


  const sidebarChatSummaries = sessionChatHistory.map(conv => ({
    id: conv.id,
    title: conv.title || (conv.messages[0]?.text.substring(0, 30) + (conv.messages[0]?.text.length > 30 ? '...' : '')) || 'Untitled Chat',
    timestamp: conv.timestamp,
  }));

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground"> {/* Ensure this uses bg-background if theme changes */}
      <Header
        onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
        onNewChat={handleNewChat} // Pass new chat handler to Header
      />
      
      <div className="flex-1 flex overflow-hidden relative">
        <main className="flex-1 flex flex-col min-w-0">
          <ChatWindow
            initialMessages={activeConversation.messages}
            initialConversationId={activeConversation.id}
            onSaveConversation={handleSaveConversation}
          />
        </main>
        
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar */}
        <aside className={`
          fixed right-0 top-0 bottom-0 z-50 w-72 sm:w-80 transform transition-transform duration-300 ease-in-out
          lg:relative lg:w-80 lg:translate-x-0 lg:block
          ${sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        `}>
          <div className="h-full mt-16 mb-16"> {/* Adjusted mt/mb for header/footer */}
            <Sidebar
              onClose={() => setSidebarOpen(false)}
              chatHistory={sidebarChatSummaries}
              onSelectChat={handleLoadChatFromSidebar}
              // onNewChat={handleNewChat} // Sidebar could also have a new chat button
            />
          </div>
        </aside>
      </div>
      
      <Footer />
    </div>
  );
};

export default Index;
