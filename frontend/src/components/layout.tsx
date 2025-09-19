import { type ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { isAuthenticated, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold">Image Gen Stream</h1>
          {isAuthenticated && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">Signed in</span>
              <Button variant="outline" size="sm" onClick={signOut}>
                Sign Out
              </Button>
            </div>
          )}
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
};
