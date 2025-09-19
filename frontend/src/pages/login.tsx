import { Button } from "@/components/ui/button";

export const LoginPage = () => {
  return (
    <div className="container mx-auto p-6 max-w-md">
      <h1 className="text-3xl font-bold mb-4">Login</h1>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Email</label>
          <input
            type="email"
            className="w-full px-3 py-2 border border-input rounded-md"
            placeholder="Enter your email"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Password</label>
          <input
            type="password"
            className="w-full px-3 py-2 border border-input rounded-md"
            placeholder="Enter your password"
          />
        </div>
        <Button className="w-full">Sign In</Button>
      </div>
    </div>
  );
};
