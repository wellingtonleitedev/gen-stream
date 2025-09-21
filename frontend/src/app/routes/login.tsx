import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLogin } from "@/features/login/api/login";
import { loginSchema } from "@/features/login/schemas";
import type { LoginRequest } from "@/features/login/types";

const LoginPage = () => {
  const { mutateAsync: handleLogin, isPending, isError } = useLogin();

  const { register, handleSubmit } = useForm<LoginRequest>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginRequest) => {
    await handleLogin(data);
  };

  return (
    <div className="container mx-auto p-6 max-w-md">
      <h1 className="text-3xl font-bold mb-4">Login</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          type="email"
          placeholder="Enter your email"
          {...register("email")}
        />

        <Input
          type="password"
          placeholder="Enter your password"
          {...register("password")}
        />

        {isError && (
          <div className="text-destructive text-sm">Login failed</div>
        )}

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Signing in..." : "Sign In"}
        </Button>
      </form>
    </div>
  );
};

export default LoginPage;
