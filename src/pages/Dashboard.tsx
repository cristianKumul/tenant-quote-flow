import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, FileText, Package, Users, DollarSign } from "lucide-react";
import { useApp } from "../contexts/AppContext";
import { formatCurrency } from "../utils/currency";
import { useNavigate } from "react-router-dom";

export function Dashboard() {
  const { state, createQuote } = useApp();
  const navigate = useNavigate();

  // Calculate stats for current user
  const userProducts = state.products.filter(p => p.userId === state.currentUser.id);
  const userQuotes = state.quotes.filter(q => q.userId === state.currentUser.id);
  const userCustomers = state.customers.filter(c => c.userId === state.currentUser.id);
  
  const totalRevenue = userQuotes
    .filter(q => q.status === 'COMPLETED')
    .reduce((sum, q) => sum + q.total, 0);
    
  const activeQuotes = userQuotes.filter(q => 
    q.status === 'PENDING' || q.status === 'IN_PROGRESS'
  ).length;

  const handleCreateQuote = () => {
    const quoteId = createQuote();
    navigate(`/quotes?edit=${quoteId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DRAFT": return "bg-gray-100 text-gray-800";
      case "PENDING": return "bg-yellow-100 text-yellow-800"; 
      case "IN_PROGRESS": return "bg-blue-100 text-blue-800";
      case "COMPLETED": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {state.currentUser.name}! Here's what's happening with your business.</p>
        </div>
        <Button variant="professional" className="md:w-auto" onClick={handleCreateQuote}>
          <Plus className="w-4 h-4" />
          Create Quote
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-card shadow-card hover:shadow-elevated transition-smooth">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
            <DollarSign className="w-5 h-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              From completed quotes
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card hover:shadow-elevated transition-smooth">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Quotes
            </CardTitle>
            <FileText className="w-5 h-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{activeQuotes}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Pending & in progress
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card hover:shadow-elevated transition-smooth">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Products
            </CardTitle>
            <Package className="w-5 h-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{userProducts.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              In your catalog
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card hover:shadow-elevated transition-smooth">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Customers
            </CardTitle>
            <Users className="w-5 h-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{userCustomers.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total customers
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Quotes */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-foreground">Recent Quotes</CardTitle>
            <CardDescription>Your latest quote activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userQuotes.slice(0, 3).map((quote) => (
                <div key={quote.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-smooth cursor-pointer" onClick={() => navigate(`/quotes?edit=${quote.id}`)}>
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-foreground">{quote.quoteNumber}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(quote.status)}`}>
                        {quote.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{quote.customerName || 'Anonymous'}</p>
                    <p className="text-xs text-muted-foreground">{quote.createdAt.toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-foreground">{formatCurrency(quote.total)}</div>
                  </div>
                </div>
              ))}
              {userQuotes.length === 0 && (
                <p className="text-sm text-muted-foreground">No quotes yet. Create your first quote!</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-foreground">Quick Actions</CardTitle>
            <CardDescription>Common tasks to get you started</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/products?new=true')}>
              <Plus className="w-4 h-4" />
              Add New Product
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={handleCreateQuote}>
              <FileText className="w-4 h-4" />
              Create Quote
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/customers?new=true')}>
              <Users className="w-4 h-4" />
              Add Customer
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/quotes')}>
              <TrendingUp className="w-4 h-4" />
              View All Quotes
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}