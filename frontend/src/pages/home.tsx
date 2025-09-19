import { Button } from "@/components/ui/button";

export const HomePage = () => {
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
