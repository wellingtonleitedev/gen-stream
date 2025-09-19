import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode } from "react";

const STALE_TIME = 5 * 60 * 1000; // 5 minutes

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: STALE_TIME,
      retry: false,
    },
  },
});

interface QueryProviderProps {
  children: ReactNode;
}

export const AppProvider = ({ children }: QueryProviderProps) => {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};
