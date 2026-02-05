import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { DocumentsProvider } from "./contexts/DocumentsContext";
import { ProjectsProvider } from "./contexts/ProjectsContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Index from "./pages/Index";
import AnalysisPage from "./pages/AnalysisPage";
import InsightDetailPage from "./pages/InsightDetailPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <ProjectsProvider>
          <DocumentsProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                
                {/* Redirect root to app */}
                <Route path="/" element={<Navigate to="/app" replace />} />
                
                {/* Protected routes */}
                <Route path="/app" element={
                  <ProtectedRoute>
                    <Index />
                  </ProtectedRoute>
                } />
                <Route path="/analysis" element={
                  <ProtectedRoute>
                    <AnalysisPage />
                  </ProtectedRoute>
                } />
                <Route path="/insight/:id" element={
                  <ProtectedRoute>
                    <InsightDetailPage />
                  </ProtectedRoute>
                } />
                
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </DocumentsProvider>
        </ProjectsProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
