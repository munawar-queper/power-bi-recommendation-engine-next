import Quiz from "../components/Quiz";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50/50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-800">
          Get personalized course recommendations based on your skill level
          </h1>
        </div>
        <Quiz />
      </div>
    </main>
  );
}
