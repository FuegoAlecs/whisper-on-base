
import Header from "@/components/Header";
import ChatWindow from "@/components/ChatWindow";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <Header />
      
      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 flex flex-col min-w-0">
          <ChatWindow />
        </main>
        
        <aside className="hidden lg:block">
          <Sidebar />
        </aside>
      </div>
      
      <Footer />
    </div>
  );
};

export default Index;
