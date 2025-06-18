
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Sparkles, Mic, MicOff } from "lucide-react";
import ChatMessage from "./ChatMessage";
import LoadingMessage from "./LoadingMessage";
import { useAnthropic } from "@/hooks/useAnthropic";
import { useToast } from "@/hooks/use-toast";
import { useWebSpeech } from '@/hooks/useWebSpeech';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// No CHAT_HISTORY_KEY here anymore

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string;
}

// Conversation interface might be defined in a shared types file if parent also uses it
export interface ConversationData { // Export if parent needs this type
  id: string;
  messages: Message[];
  timestamp: number;
  title?: string;
}

interface ChatWindowProps {
  onSaveConversation: (conversation: ConversationData) => void;
  initialMessages?: Message[] | null;
  initialConversationId?: string | null;
  // Add other props if ChatWindow expects any, e.g., isSidebarOpen, toggleSidebar
}

const ChatWindow = ({
  onSaveConversation,
  initialMessages,
  initialConversationId
}: ChatWindowProps) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages || []);
  const [inputValue, setInputValue] = useState("");
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(initialConversationId || null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { sendMessage, isLoading } = useAnthropic();
  const { toast } = useToast();

  const {
    isListening,
    startListening,
    stopListening,
    speak,
    isSTTSupported,
    isTTSSupported,
  } = useWebSpeech({
    onSTTResult: (finalTranscript) => {
      setInputValue(finalTranscript);
    },
    onSTTError: (error: any) => {
      console.error('STT Error:', error);
      const errorMessage = error?.message || (typeof error === 'string' ? error : 'An unknown error occurred. Common issues include microphone permission denial.');
      toast({
        title: "Speech Recognition Error",
        description: `Could not start microphone: ${errorMessage}. Please ensure microphone access is allowed in your browser settings.`,
        variant: "destructive",
      });
    },
    onTTSError: (error: any) => {
      console.error('TTS Error:', error);
      const errorMessage = error?.message || (typeof error === 'string' ? error : 'An unknown error occurred.');
      toast({
        title: "Speech Synthesis Error",
        description: `Could not play audio: ${errorMessage}.`,
        variant: "destructive",
      });
    }
  });

  useEffect(() => {
    if (!isSTTSupported && !localStorage.getItem('sttUnsupportedToastShown')) {
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser does not support the Web Speech API for speech-to-text.",
        variant: "default",
        duration: 5000,
      });
      localStorage.setItem('sttUnsupportedToastShown', 'true');
    }
    if (!isTTSSupported && !localStorage.getItem('ttsUnsupportedToastShown')) {
      toast({
        title: "Text-to-Speech Not Supported",
        description: "Your browser does not support the Web Speech API for text-to-speech.",
        variant: "default",
        duration: 5000,
      });
      localStorage.setItem('ttsUnsupportedToastShown', 'true');
    }
  }, [isSTTSupported, isTTSSupported, toast]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    // Sync with props if a conversation is loaded/switched by parent
    setMessages(initialMessages || []);
    setCurrentConversationId(initialConversationId || null);
    // When a new chat is loaded, clear the input field
    if (initialConversationId || (initialMessages && initialMessages.length > 0)) {
      setInputValue("");
    }
  }, [initialMessages, initialConversationId]);


  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    let tempNewChatId: string | null = null;
    if (messages.length === 0 && !currentConversationId) {
      // This is the very start of a brand-new chat session.
      // An ID will be generated and associated when the first message is saved.
      // For now, we don't set currentConversationId state immediately,
      // but prepare a tempId if needed for the save operation.
      tempNewChatId = Date.now().toString();
    }

    const userMessage: Message = {
      id: Date.now().toString(), // Unique ID for the message itself
      text: inputValue,
      isUser: true,
      timestamp: new Date().toLocaleTimeString()
    };

    // Optimistically update UI with user message
    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue("");

    try {
      // Prepare conversation history for AI (current messages + new user message)
      // The 'messages' state here already includes the new userMessage due to the optimistic update above.
      const conversationHistoryForAI = messages.map(msg => ({ // `messages` here is from the closure, before userMessage is added by setMessages
        role: (msg.isUser ? 'user' : 'assistant') as 'user' | 'assistant',
        content: msg.text
      }));
      conversationHistoryForAI.push({ // Add the current user input that triggered the send
        role: 'user' as const,
        content: currentInput
      });


      const aiResponse = await sendMessage(conversationHistoryForAI);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(), // Unique ID for the AI message
        text: aiResponse,
        isUser: false,
        timestamp: new Date().toLocaleTimeString()
      };

      if (isTTSSupported) {
        speak(aiMessage.text);
      }
      
      // Update messages state with AI response and then trigger save
      setMessages(prevMessages => {
        const newMessages = [...prevMessages, aiMessage];

        const finalConversationId = currentConversationId || tempNewChatId || Date.now().toString(); // tempNewChatId is for a brand new chat

        if (!currentConversationId && tempNewChatId) {
          // This was a new chat, now set its ID in state for subsequent messages in this session
          setCurrentConversationId(finalConversationId);
        }

        const conversationToSave: ConversationData = {
          id: finalConversationId,
          messages: newMessages,
          timestamp: Date.now(),
          title: newMessages[0]?.isUser
                 ? (newMessages[0].text.substring(0, 30) + (newMessages[0].text.length > 30 ? '...' : ''))
                 : (newMessages[1]?.text.substring(0, 30) + (newMessages[1]?.text.length > 30 ? '...' : '')) || "Chat", // Title from first user or AI message
        };

        onSaveConversation(conversationToSave);

        return newMessages; // Return newMessages for the state update
      });

    } catch (error) {
      console.error('Error sending message:', error);
      // If AI call fails, user message is already in `messages`.
      // We might want to remove it or provide a "retry" option.
      // For now, just toast.
      toast({
        title: "Connection Issue",
        description: "There was a problem processing your message. Please try again!",
        variant: "default",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col flex-1 overflow-y-auto p-2 sm:p-4 lg:p-6 space-y-2 sm:space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col justify-center items-center h-full px-2 sm:px-4">
            <div className="mb-3 sm:mb-6 text-center">
              <Sparkles className="h-6 w-6 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-orange-500 mx-auto mb-2 sm:mb-4" />
              <h3 className="text-base sm:text-xl lg:text-2xl font-bold text-white mb-1 sm:mb-2">Hi, I'm ChainWhisper</h3>
              <p className="text-gray-400 text-xs sm:text-base">Your AI oracle for Base network data</p>
              <div className="mt-2 text-white text-xs">
                Connected to Alchemy for real blockchain data analysis
              </div>
            </div>
          </div>
        )}
        
        {messages.map((message) => (
          <ChatMessage
            key={message.id} // Ensure unique keys, especially if IDs can repeat across reloads initially
            message={message.text}
            isUser={message.isUser}
            timestamp={message.timestamp}
            // Pass down TTS capabilities for AI messages
            onSpeak={!message.isUser && isTTSSupported ? speak : undefined}
            isTTSSupported={!message.isUser ? isTTSSupported : undefined}
          />
        ))}
        
        {isLoading && <LoadingMessage />}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-gray-800 bg-gray-950/95 backdrop-blur-sm p-2 sm:p-4 lg:p-6">
        <TooltipProvider>
        <div className="flex gap-1.5 sm:gap-3 max-w-4xl mx-auto items-center">
          <div className="flex-1 relative">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask a question about on-chain activity..."
              className="bg-gray-900 border-gray-700 text-white placeholder-gray-500 focus:border-orange-500 focus:ring-orange-500/20 rounded-lg text-xs sm:text-base py-1.5 sm:py-3 lg:py-4 px-2 sm:px-4"
              disabled={isLoading}
            />
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={isListening ? stopListening : startListening}
                disabled={!isSTTSupported || isLoading}
                variant="outline"
                size="icon"
                className="p-2 sm:p-3 lg:p-4 rounded-lg border-gray-700 hover:bg-gray-800 data-[state=open]:bg-gray-800"
              >
                {isListening ? <MicOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Mic className="h-4 w-4 sm:h-5 sm:w-5" />}
                <span className="sr-only">{isListening ? "Stop listening" : "Start listening"}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{!isSTTSupported ? "Speech input not supported" : (isListening ? "Stop voice input" : "Use microphone")}</p>
            </TooltipContent>
          </Tooltip>
          <Button
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading || isListening}
            className="bg-orange-600 hover:bg-orange-700 text-white px-2 sm:px-4 lg:px-6 py-1.5 sm:py-3 lg:py-4 rounded-lg transition-all duration-200 flex-shrink-0"
          >
            <Send className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5" />
            <span className="hidden sm:inline ml-2">Whisper</span>
          </Button>
        </div>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default ChatWindow;
