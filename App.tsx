import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { initializeAuthSession, useAuthStore } from "./src/store/useAuthStore";
import { useWorkspaceStore } from "./src/store/useWorkspaceStore";

// Optimized TanStack Query Client for Ultra-Fast Mobile Caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30, // 30 seconds fresh cache
      gcTime: 1000 * 60 * 10, // 10 minutes garbage collection
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  useEffect(() => {
    // Hydrate auth session & workspace on startup
    initializeAuthSession().then(() => {
      if (useAuthStore.getState().isAuthenticated) {
        useWorkspaceStore.getState().fetchWorkspace();
      }
    });
  }, []);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="dark" backgroundColor="#FFFFFF" />
        <RootNavigator />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
