import { RouterProvider } from "react-router-dom";
import { router } from "./Router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { initTsrReactQuery } from "@ts-rest/react-query/v5";
import { contract } from "@kltn/contract";

// Use environment variable for the base URL
const apiUrl = import.meta.env.VITE_API_URL || "http://localhost/api";

export const tsr = initTsrReactQuery(contract, {
  baseUrl: apiUrl.endsWith("/api") ? apiUrl.slice(0, -4) : apiUrl, // Remove trailing '/api' if present
  baseHeaders: {
    "x-app-source": "ts-rest",
  },
  credentials: "include",
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <tsr.ReactQueryProvider>{children}</tsr.ReactQueryProvider>
    </QueryClientProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <tsr.ReactQueryProvider>
        <RouterProvider router={router} />;
      </tsr.ReactQueryProvider>
    </QueryClientProvider>
  );
}

export default App;
