import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Download, Eye, Edit } from "lucide-react";
import { useApp } from "../contexts/AppContext";
import { formatCurrency } from "../utils/currency";
import { generateQuotePDF } from "../utils/pdf";
import { QuoteStatus } from "../types";

export function QuotesList() {
  const { state, createQuote } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [statusFilter, setStatusFilter] = useState<QuoteStatus | "ALL">("ALL");

  const userQuotes = state.quotes.filter(q => q.userId === state.currentUser.id);
  const userCustomers = state.customers.filter(c => c.userId === state.currentUser.id);
  
  const filteredQuotes = statusFilter === "ALL" 
    ? userQuotes 
    : userQuotes.filter(q => q.status === statusFilter);

  const handleCreateQuote = () => {
    const quoteId = createQuote();
    navigate(`/quotes?edit=${quoteId}`);
  };

  const handleDownloadPDF = (quote: any) => {
    const customer = quote.customerId ? userCustomers.find(c => c.id === quote.customerId) : undefined;
    generateQuotePDF(quote, customer);
  };

  const getStatusColor = (status: QuoteStatus) => {
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
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Quotes</h1>
          <p className="text-muted-foreground">Manage all your quotes and proposals</p>
        </div>
        <Button onClick={handleCreateQuote}>
          <Plus className="w-4 h-4" />
          New Quote
        </Button>
      </div>

      <Card className="shadow-card">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as QuoteStatus | "ALL")}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filteredQuotes.map((quote) => (
          <Card key={quote.id} className="shadow-card hover:shadow-elevated transition-smooth">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold">{quote.quoteNumber}</h3>
                    <Badge className={getStatusColor(quote.status)}>
                      {quote.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {quote.customerName || 'Anonymous Customer'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Created: {quote.createdAt.toLocaleDateString()} • 
                    Items: {quote.items.length}
                  </p>
                </div>
                <div className="text-right space-y-2">
                  <div className="text-xl font-bold">{formatCurrency(quote.total)}</div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => navigate(`/quotes?edit=${quote.id}`)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDownloadPDF(quote)}>
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredQuotes.length === 0 && (
          <Card className="shadow-card">
            <CardContent className="text-center py-12">
              <h3 className="text-lg font-semibold mb-2">No quotes found</h3>
              <p className="text-muted-foreground mb-6">
                {statusFilter === "ALL" ? "Create your first quote to get started" : `No quotes with status: ${statusFilter}`}
              </p>
              <Button onClick={handleCreateQuote}>
                <Plus className="w-4 h-4" />
                Create Quote
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}