import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DocumentsProvider } from "./contexts/DocumentsContext";
import { ProjectsProvider } from "./contexts/ProjectsContext";
import Index from "./pages/Index";
import AnalysisPage from "./pages/AnalysisPage";
import AskResultsPage from "./pages/AskResultsPage";
import InsightDetailPage from "./pages/InsightDetailPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ProjectsProvider>
        <DocumentsProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/analysis" element={<AnalysisPage />} />
              <Route path="/ask" element={<AskResultsPage />} />
              <Route path="/insight/:id" element={<InsightDetailPage />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </DocumentsProvider>
      </ProjectsProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
