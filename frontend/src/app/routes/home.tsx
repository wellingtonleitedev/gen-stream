import { useRequireAuth } from "@/hooks/use-auth";
import { GenerationFlow } from "@/features/generation/components";

export const HomePage = () => {
  const isAuthenticated = useRequireAuth();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            AI Image Generator
          </h1>
          <p className="text-gray-600">
            Generate high-quality images using AI with real-time progress
            tracking
          </p>
        </header>

        <main>
          <GenerationFlow />
        </main>
      </div>
    </div>
  );
};
