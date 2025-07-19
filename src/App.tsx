import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { Layout } from "./components/Layout";
import { ProductsManager } from "./pages/ProductsManager";
import { QuotesList } from "./pages/QuotesList";
import { QuoteBuilder } from "./pages/QuoteBuilder";
import { AdminDashboard } from "./pages/AdminDashboard";
import { QuotesRouter } from "./pages/QuotesRouter";
import { AuthProvider } from "./contexts/AuthContext";
import { AppProvider } from "./contexts/AppContext";
import { ProtectedRoute } from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={
              <ProtectedRoute>
                <AppProvider>
                  <Index />
                </AppProvider>
              </ProtectedRoute>
            } />
            <Route path="/products" element={
              <ProtectedRoute>
                <AppProvider>
                  <Layout>
                    <ProductsManager />
                  </Layout>
                </AppProvider>
              </ProtectedRoute>
            } />
            <Route path="/quotes" element={
              <ProtectedRoute>
                <AppProvider>
                  <Layout>
                    <QuotesRouter />
                  </Layout>
                </AppProvider>
              </ProtectedRoute>
            } />
            <Route path="/customers" element={
              <ProtectedRoute>
                <AppProvider>
                  <Layout>
                    <div className="p-8">
                      <h1 className="text-3xl font-bold">Customers</h1>
                      <p className="text-muted-foreground">Customer management coming soon...</p>
                    </div>
                  </Layout>
                </AppProvider>
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute>
                <AppProvider>
                  <Layout>
                    <AdminDashboard />
                  </Layout>
                </AppProvider>
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute>
                <AppProvider>
                  <Layout>
                    <div className="p-8">
                      <h1 className="text-3xl font-bold">User Management</h1>
                      <p className="text-muted-foreground">User management coming soon...</p>
                    </div>
                  </Layout>
                </AppProvider>
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <AppProvider>
                  <Layout>
                    <div className="p-8">
                      <h1 className="text-3xl font-bold">Settings</h1>
                      <p className="text-muted-foreground">Settings coming soon...</p>
                    </div>
                  </Layout>
                </AppProvider>
              </ProtectedRoute>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
