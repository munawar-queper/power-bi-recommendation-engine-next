import Header from "../components/Header";
import Footer from "../components/Footer";
import Quiz from "../components/Quiz";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-gray-50">
      <Header />
      <main className="flex-grow py-12">
        <Quiz />
      </main>
      <Footer />
    </div>
  );
}
