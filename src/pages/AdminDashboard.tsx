import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Users, Package, Shield, AlertTriangle } from "lucide-react";
import { useApp } from "../contexts/AppContext";
import { formatCurrency } from "../utils/currency";

export function AdminDashboard() {
  const { state, toggleUserAccess } = useApp();

  if (state.currentUser.role !== 'SUPERADMIN') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
            <p className="text-muted-foreground">You need superadmin privileges to access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const regularUsers = state.users.filter(u => u.role === 'USER');
  const totalProducts = state.products.length;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground">System administration and user management</p>
      </div>

      {/* Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-gradient-card shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
            <Users className="w-5 h-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{regularUsers.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active: {regularUsers.filter(u => u.isActive).length}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Products</CardTitle>
            <Package className="w-5 h-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalProducts}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all users
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">System Status</CardTitle>
            <Shield className="w-5 h-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">Healthy</div>
            <p className="text-xs text-muted-foreground mt-1">
              All systems operational
            </p>
          </CardContent>
        </Card>
      </div>

      {/* User Management */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {regularUsers.map((user) => {
              const userProducts = state.products.filter(p => p.userId === user.id);
              return (
                <div key={user.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{user.name}</span>
                      <Badge variant={user.isActive ? "default" : "secondary"}>
                        {user.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Products: {userProducts.length} • 
                      Joined: {user.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right text-sm">
                      <div>{userProducts.length} products</div>
                      <div className="text-muted-foreground">
                        Avg: {userProducts.length > 0 ? formatCurrency(userProducts.reduce((sum, p) => sum + p.basePrice, 0) / userProducts.length) : '$0.00'}
                      </div>
                    </div>
                    <Switch
                      checked={user.isActive}
                      onCheckedChange={() => toggleUserAccess(user.id)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}