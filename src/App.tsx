import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { Layout } from "./components/Layout";
import { ProductsManager } from "./pages/ProductsManager";
import { QuotesList } from "./pages/QuotesList";
import { QuoteBuilder } from "./pages/QuoteBuilder";
import { AdminDashboard } from "./pages/AdminDashboard";
import { QuotesRouter } from "./pages/QuotesRouter";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/products" element={
            <Layout>
              <ProductsManager />
            </Layout>
          } />
          <Route path="/quotes" element={
            <Layout>
              <QuotesRouter />
            </Layout>
          } />
          <Route path="/customers" element={
            <Layout>
              <div className="p-8">
                <h1 className="text-3xl font-bold">Customers</h1>
                <p className="text-muted-foreground">Customer management coming soon...</p>
              </div>
            </Layout>
          } />
          <Route path="/admin" element={
            <Layout>
              <AdminDashboard />
            </Layout>
          } />
          <Route path="/admin/users" element={
            <Layout>
              <div className="p-8">
                <h1 className="text-3xl font-bold">User Management</h1>
                <p className="text-muted-foreground">User management coming soon...</p>
              </div>
            </Layout>
          } />
          <Route path="/settings" element={
            <Layout>
              <div className="p-8">
                <h1 className="text-3xl font-bold">Settings</h1>
                <p className="text-muted-foreground">Settings coming soon...</p>
              </div>
            </Layout>
          } />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
