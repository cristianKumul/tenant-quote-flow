import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Trash2, Download, Save, Package, User, DollarSign } from "lucide-react";
import { useApp } from "../contexts/AppContext";
import { formatCurrency, parseCurrency } from "../utils/currency";
import { generateQuotePDF } from "../utils/pdf";
import { useToast } from "@/hooks/use-toast";
import { Quote, QuoteStatus } from "../types";

export function QuoteBuilder() {
  const { state, updateQuote, addQuoteItem, updateQuoteItem, removeQuoteItem, addCustomer, addCollect } = useApp();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const quoteId = searchParams.get('edit');
  
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [customPrice, setCustomPrice] = useState("");
  const [isAddProductDialogOpen, setIsAddProductDialogOpen] = useState(false);
  const [isAddCustomerDialogOpen, setIsAddCustomerDialogOpen] = useState(false);
  const [isAddCollectDialogOpen, setIsAddCollectDialogOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    address: ""
  });
  const [newCollect, setNewCollect] = useState({
    amount: "",
    paymentMethod: "",
    notes: ""
  });

  const quote = state.quotes.find(q => q.id === quoteId);
  const userProducts = state.products.filter(p => p.userId === state.currentUser.id);
  const userCustomers = state.customers.filter(c => c.userId === state.currentUser.id);
  const quoteCollects = state.collects?.filter(c => c.quoteId === quoteId) || [];

  useEffect(() => {
    if (!quote) {
      navigate('/quotes');
    }
  }, [quote, navigate]);

  if (!quote) {
    return null;
  }

  const handleStatusChange = (status: QuoteStatus) => {
    updateQuote(quote.id, { status });
    toast({
      title: "Success",
      description: `Quote status updated to ${status}`
    });
  };

  const handleCustomerChange = (customerId: string) => {
    if (customerId === 'anonymous') {
      updateQuote(quote.id, { customerId: undefined, customerName: undefined });
    } else {
      const customer = userCustomers.find(c => c.id === customerId);
      if (customer) {
        updateQuote(quote.id, { 
          customerId: customer.id, 
          customerName: customer.name 
        });
      }
    }
  };

  const handleAddProduct = () => {
    if (!selectedProductId) {
      toast({
        title: "Error",
        description: "Please select a product",
        variant: "destructive"
      });
      return;
    }

    const qty = parseInt(quantity);
    const price = customPrice ? parseCurrency(customPrice) : undefined;

    if (qty <= 0) {
      toast({
        title: "Error",
        description: "Quantity must be greater than 0",
        variant: "destructive"
      });
      return;
    }

    addQuoteItem(quote.id, selectedProductId, qty, price);
    
    // Reset form
    setSelectedProductId("");
    setQuantity("1");
    setCustomPrice("");
    setIsAddProductDialogOpen(false);
    
    toast({
      title: "Success",
      description: "Product added to quote"
    });
  };

  const handleUpdateItem = (itemId: string, field: string, value: string) => {
    const updates: any = {};
    
    if (field === 'quantity') {
      const qty = parseInt(value);
      if (qty > 0) {
        updates.quantity = qty;
      }
    } else if (field === 'unitPrice') {
      const price = parseCurrency(value);
      if (price >= 0) {
        updates.unitPrice = price;
      }
    }
    
    updateQuoteItem(quote.id, itemId, updates);
  };

  const handleAddCustomer = () => {
    if (!newCustomer.name) {
      toast({
        title: "Error",
        description: "Customer name is required",
        variant: "destructive"
      });
      return;
    }

    addCustomer(newCustomer);
    setIsAddCustomerDialogOpen(false);
    setNewCustomer({ name: "", email: "", company: "", phone: "", address: "" });
    
    toast({
      title: "Success",
      description: "Customer added successfully"
    });
  };

  const handleAddCollect = () => {
    const amount = parseCurrency(newCollect.amount);
    const remainingBalance = quote.total - quote.totalPaid;
    
    if (amount <= 0) {
      toast({
        title: "Error",
        description: "Amount must be greater than 0",
        variant: "destructive"
      });
      return;
    }
    
    if (amount > remainingBalance) {
      toast({
        title: "Error", 
        description: `Amount cannot exceed remaining balance of ${formatCurrency(remainingBalance)}`,
        variant: "destructive"
      });
      return;
    }
    
    if (!newCollect.paymentMethod) {
      toast({
        title: "Error",
        description: "Payment method is required",
        variant: "destructive"
      });
      return;
    }
    
    // Add the collect record to the database
    addCollect({
      quoteId: quote.id,
      userId: state.currentUser.id,
      amount,
      paymentMethod: newCollect.paymentMethod,
      notes: newCollect.notes || undefined,
      collectedAt: new Date()
    });
    
    // Update the quote's total paid amount
    const newTotalPaid = quote.totalPaid + amount;
    updateQuote(quote.id, { totalPaid: newTotalPaid });
    
    setNewCollect({ amount: "", paymentMethod: "", notes: "" });
    setIsAddCollectDialogOpen(false);
    
    toast({
      title: "Success",
      description: "Payment recorded successfully"
    });
  };

  const handleDownloadPDF = () => {
    const customer = quote.customerId ? userCustomers.find(c => c.id === quote.customerId) : undefined;
    generateQuotePDF(quote, customer);
    
    toast({
      title: "Success",
      description: "PDF downloaded successfully"
    });
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
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Edit Quote</h1>
          <p className="text-muted-foreground">Quote: {quote.quoteNumber}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleDownloadPDF}>
            <Download className="w-4 h-4" />
            Download PDF
          </Button>
          <Button onClick={() => navigate('/quotes')}>
            <Save className="w-4 h-4" />
            Done
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Quote Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status and Customer */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Quote Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Status</Label>
                <Select value={quote.status} onValueChange={handleStatusChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Customer</Label>
                  <Dialog open={isAddCustomerDialogOpen} onOpenChange={setIsAddCustomerDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Plus className="w-4 h-4" />
                        Add Customer
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Customer</DialogTitle>
                        <DialogDescription>Create a new customer for this quote.</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="customerName">Name *</Label>
                          <Input
                            id="customerName"
                            value={newCustomer.name}
                            onChange={(e) => setNewCustomer(prev => ({ ...prev, name: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="customerEmail">Email</Label>
                          <Input
                            id="customerEmail"
                            type="email"
                            value={newCustomer.email}
                            onChange={(e) => setNewCustomer(prev => ({ ...prev, email: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="customerCompany">Company</Label>
                          <Input
                            id="customerCompany"
                            value={newCustomer.company}
                            onChange={(e) => setNewCustomer(prev => ({ ...prev, company: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="customerPhone">Phone</Label>
                          <Input
                            id="customerPhone"
                            value={newCustomer.phone}
                            onChange={(e) => setNewCustomer(prev => ({ ...prev, phone: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="customerAddress">Address</Label>
                          <Textarea
                            id="customerAddress"
                            value={newCustomer.address}
                            onChange={(e) => setNewCustomer(prev => ({ ...prev, address: e.target.value }))}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddCustomerDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleAddCustomer}>Add Customer</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                <Select 
                  value={quote.customerId || 'anonymous'} 
                  onValueChange={handleCustomerChange}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="anonymous">Anonymous Customer</SelectItem>
                    {userCustomers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name} {customer.company && `(${customer.company})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={quote.notes || ""}
                  onChange={(e) => updateQuote(quote.id, { notes: e.target.value })}
                  placeholder="Add any notes or terms..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Quote Items */}
          <Card className="shadow-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Quote Items</CardTitle>
                <Dialog open={isAddProductDialogOpen} onOpenChange={setIsAddProductDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4" />
                      Add Product
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Product to Quote</DialogTitle>
                      <DialogDescription>Select a product and specify quantity and pricing.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Product</Label>
                        <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a product" />
                          </SelectTrigger>
                          <SelectContent>
                            {userProducts.map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.name} - {formatCurrency(product.basePrice)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="quantity">Quantity</Label>
                        <Input
                          id="quantity"
                          type="number"
                          min="1"
                          value={quantity}
                          onChange={(e) => setQuantity(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="customPrice">Custom Price (optional)</Label>
                        <Input
                          id="customPrice"
                          type="number"
                          step="0.01"
                          min="0"
                          value={customPrice}
                          onChange={(e) => setCustomPrice(e.target.value)}
                          placeholder="Leave empty to use base price"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddProductDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddProduct}>Add to Quote</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {quote.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 border border-border rounded-lg">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Package className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div>
                        <h4 className="font-medium">{item.productName}</h4>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <Label className="text-xs">Quantity</Label>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleUpdateItem(item.id, 'quantity', e.target.value)}
                            className="h-8"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Unit Price</Label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.unitPrice}
                            onChange={(e) => handleUpdateItem(item.id, 'unitPrice', e.target.value)}
                            className="h-8"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Total</Label>
                          <div className="h-8 flex items-center font-medium">
                            {formatCurrency(item.totalPrice)}
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeQuoteItem(quote.id, item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                
                {quote.items.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No items added yet. Click "Add Product" to get started.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Payments History */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>Record of partial payments received for this quote</CardDescription>
            </CardHeader>
            <CardContent>
              {quoteCollects.length > 0 ? (
                <div className="space-y-4">
                  {quoteCollects.map((collect) => (
                    <div key={collect.id} className="flex items-center gap-4 p-4 border border-border rounded-lg">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{formatCurrency(collect.amount)}</p>
                            <p className="text-sm text-muted-foreground capitalize">{collect.paymentMethod}</p>
                            {collect.notes && (
                              <p className="text-sm text-muted-foreground mt-1">{collect.notes}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">
                              {new Date(collect.collectedAt).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(collect.collectedAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No payments recorded yet.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quote Summary */}
        <div className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Quote Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">Status:</span>
                <Badge className={getStatusColor(quote.status)}>
                  {quote.status}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Subtotal:</span>
                  <span className="font-medium">{formatCurrency(quote.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Paid:</span>
                  <span className="font-medium text-green-600">{formatCurrency(quote.totalPaid)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Remaining:</span>
                  <span className="font-medium text-orange-600">{formatCurrency(quote.total - quote.totalPaid)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-medium">Total:</span>
                  <span className="text-lg font-bold">{formatCurrency(quote.total)}</span>
                </div>
              </div>
              
              {quote.total - quote.totalPaid > 0 && (
                <Dialog open={isAddCollectDialogOpen} onOpenChange={setIsAddCollectDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full">
                      <DollarSign className="w-4 h-4" />
                      Record Payment
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Record Partial Payment</DialogTitle>
                      <DialogDescription>
                        Record a partial payment for this quote. Remaining balance: {formatCurrency(quote.total - quote.totalPaid)}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="collectAmount">Amount *</Label>
                        <Input
                          id="collectAmount"
                          type="number"
                          step="0.01"
                          min="0.01"
                          max={quote.total - quote.totalPaid}
                          value={newCollect.amount}
                          onChange={(e) => setNewCollect(prev => ({ ...prev, amount: e.target.value }))}
                          placeholder="Enter payment amount"
                        />
                      </div>
                      <div>
                        <Label htmlFor="paymentMethod">Payment Method *</Label>
                        <Select value={newCollect.paymentMethod} onValueChange={(value) => setNewCollect(prev => ({ ...prev, paymentMethod: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment method" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cash">Cash</SelectItem>
                            <SelectItem value="transfer">Bank Transfer</SelectItem>
                            <SelectItem value="check">Check</SelectItem>
                            <SelectItem value="card">Credit/Debit Card</SelectItem>
                            <SelectItem value="paypal">PayPal</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="collectNotes">Notes (optional)</Label>
                        <Textarea
                          id="collectNotes"
                          value={newCollect.notes}
                          onChange={(e) => setNewCollect(prev => ({ ...prev, notes: e.target.value }))}
                          placeholder="Add any notes about this payment..."
                          rows={3}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddCollectDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddCollect}>Record Payment</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}

              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  Items: {quote.items.length}
                </div>
                <div className="text-sm text-muted-foreground">
                  Created: {quote.createdAt.toLocaleDateString()}
                </div>
                <div className="text-sm text-muted-foreground">
                  Updated: {quote.updatedAt.toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>

          {quote.customerId && (
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Customer Info</CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const customer = userCustomers.find(c => c.id === quote.customerId);
                  return customer ? (
                    <div className="space-y-2">
                      <div>
                        <span className="font-medium">{customer.name}</span>
                      </div>
                      {customer.company && (
                        <div className="text-sm text-muted-foreground">
                          {customer.company}
                        </div>
                      )}
                      {customer.email && (
                        <div className="text-sm text-muted-foreground">
                          {customer.email}
                        </div>
                      )}
                      {customer.phone && (
                        <div className="text-sm text-muted-foreground">
                          {customer.phone}
                        </div>
                      )}
                    </div>
                  ) : null;
                })()}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}