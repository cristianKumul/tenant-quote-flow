import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Edit, Trash2, Package } from "lucide-react";
import { useApp } from "../contexts/AppContext";
import { formatCurrency, parseCurrency } from "../utils/currency";
import { useToast } from "@/hooks/use-toast";

export function ProductsManager() {
  const { state, addProduct, updateProduct, deleteProduct } = useApp();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    basePrice: ""
  });

  // Filter products for current user
  const userProducts = state.products.filter(p => p.userId === state.currentUser.id);
  
  const filteredProducts = userProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = () => {
    if (!formData.name || !formData.basePrice) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const basePrice = parseCurrency(formData.basePrice);
    if (basePrice <= 0) {
      toast({
        title: "Error", 
        description: "Price must be greater than 0",
        variant: "destructive"
      });
      return;
    }

    if (editingProduct) {
      updateProduct(editingProduct, {
        name: formData.name,
        description: formData.description,
        basePrice
      });
      toast({
        title: "Success",
        description: "Product updated successfully"
      });
    } else {
      addProduct({
        name: formData.name,
        description: formData.description,
        basePrice
      });
      toast({
        title: "Success",
        description: "Product added successfully"
      });
    }

    setFormData({ name: "", description: "", basePrice: "" });
    setEditingProduct(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (product: any) => {
    setFormData({
      name: product.name,
      description: product.description,
      basePrice: product.basePrice.toString()
    });
    setEditingProduct(product.id);
    setIsDialogOpen(true);
  };

  const handleDelete = (productId: string) => {
    deleteProduct(productId);
    toast({
      title: "Success",
      description: "Product deleted successfully"
    });
  };

  const resetForm = () => {
    setFormData({ name: "", description: "", basePrice: "" });
    setEditingProduct(null);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground">Manage your product catalog and pricing</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button variant="professional">
              <Plus className="w-4 h-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
              <DialogDescription>
                {editingProduct ? 'Update product details below.' : 'Add a new product to your catalog.'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter product name"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter product description"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="basePrice">Base Price *</Label>
                <Input
                  id="basePrice"
                  value={formData.basePrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, basePrice: e.target.value }))}
                  placeholder="0.00"
                  type="number"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                {editingProduct ? 'Update Product' : 'Add Product'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card className="shadow-card">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search products by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="bg-gradient-card shadow-card hover:shadow-elevated transition-smooth">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-foreground">{product.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Created {product.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {product.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {product.description}
                </p>
              )}
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Base Price:</span>
                  <span className="font-bold text-lg text-foreground">
                    {formatCurrency(product.basePrice)}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-border">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(product)}>
                  <Edit className="w-4 h-4" />
                  Edit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1" 
                  onClick={() => handleDelete(product.id)}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <Card className="shadow-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No products found</h3>
            <p className="text-muted-foreground text-center mb-6">
              {searchTerm ? "Try adjusting your search terms" : "Get started by adding your first product"}
            </p>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="professional">
                  <Plus className="w-4 h-4" />
                  Add Your First Product
                </Button>
              </DialogTrigger>
            </Dialog>
          </CardContent>
        </Card>
      )}
    </div>
  );
}