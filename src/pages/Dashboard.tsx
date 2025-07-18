import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, FileText, Package, Users } from "lucide-react";

export function Dashboard() {
  const stats = [
    {
      title: "Total Quotes",
      value: "24",
      description: "+12% from last month",
      icon: FileText,
      color: "text-blue-600"
    },
    {
      title: "Active Products",
      value: "127",
      description: "+8% from last month", 
      icon: Package,
      color: "text-green-600"
    },
    {
      title: "Customers",
      value: "89",
      description: "+23% from last month",
      icon: Users,
      color: "text-purple-600"
    },
    {
      title: "Revenue",
      value: "$24,500",
      description: "+18% from last month",
      icon: TrendingUp,
      color: "text-orange-600"
    }
  ];

  const recentQuotes = [
    { id: "Q-001", customer: "Acme Corp", amount: "$4,500", status: "PENDING", date: "2024-01-15" },
    { id: "Q-002", customer: "TechStart Inc", amount: "$2,300", status: "IN_PROGRESS", date: "2024-01-14" },
    { id: "Q-003", customer: "Global Solutions", amount: "$8,900", status: "COMPLETED", date: "2024-01-13" },
  ];

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
          <p className="text-muted-foreground">Welcome back! Here's what's happening with your business.</p>
        </div>
        <Button variant="professional" className="md:w-auto">
          <Plus className="w-4 h-4" />
          Create Quote
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="bg-gradient-card shadow-card hover:shadow-elevated transition-smooth">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
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
              {recentQuotes.map((quote) => (
                <div key={quote.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-smooth">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-foreground">{quote.id}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(quote.status)}`}>
                        {quote.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{quote.customer}</p>
                    <p className="text-xs text-muted-foreground">{quote.date}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-foreground">{quote.amount}</div>
                  </div>
                </div>
              ))}
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
            <Button variant="outline" className="w-full justify-start">
              <Plus className="w-4 h-4" />
              Add New Product
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <FileText className="w-4 h-4" />
              Create Quote
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Users className="w-4 h-4" />
              Add Customer
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <TrendingUp className="w-4 h-4" />
              View Reports
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}