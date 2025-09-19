import { Button } from "@/components/ui/button";
import { useRequireAuth } from "@/hooks/use-auth";

export const HomePage = () => {
  const isAuthenticated = useRequireAuth();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Home</h1>
      <p className="text-muted-foreground mb-4">
        Welcome to the Image Generation System
      </p>
      <Button>Test Button</Button>
    </div>
  );
};
