import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AssistantBot from "../components/AssistantBot";

const Assistant = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <AssistantBot className="static bottom-auto right-auto" />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Assistant;


