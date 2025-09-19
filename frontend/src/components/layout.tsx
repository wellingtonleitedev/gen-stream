import { type ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-6 py-4">
          <h1 className="text-xl font-semibold">Image Gen Stream</h1>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
};
