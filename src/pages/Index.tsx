
import Header from "@/components/Header";
import ChatWindow from "@/components/ChatWindow";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import { useState } from "react";

const Index = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-gray-950">
      <Header onSidebarToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex-1 flex overflow-hidden relative">
        <main className="flex-1 flex flex-col min-w-0">
          <ChatWindow />
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
          <div className="h-full mt-12 sm:mt-14 lg:mt-16 mb-12 sm:mb-14 lg:mb-16">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </aside>
      </div>
      
      <Footer />
    </div>
  );
};

export default Index;
