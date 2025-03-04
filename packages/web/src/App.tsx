import { RouterProvider } from "react-router-dom";
import { router } from "./Router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { initTsrReactQuery } from "@ts-rest/react-query/v5";
import { articleContract } from "@kltn/contract";

export const tsr = initTsrReactQuery(articleContract, {
  baseUrl: "http://localhost:5000",
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
