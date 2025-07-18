import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { AppState, User, Product, Customer, Quote, QuoteItem, QuoteStatus } from '../types';

interface AppContextType {
  state: AppState;
  // User actions
  switchUser: (userId: string) => void;
  toggleUserAccess: (userId: string) => void;
  
  // Product actions
  addProduct: (product: Omit<Product, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  
  // Customer actions
  addCustomer: (customer: Omit<Customer, 'id' | 'userId' | 'createdAt'>) => void;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  
  // Quote actions
  createQuote: () => string;
  updateQuote: (id: string, updates: Partial<Quote>) => void;
  addQuoteItem: (quoteId: string, productId: string, quantity?: number, customPrice?: number) => void;
  updateQuoteItem: (quoteId: string, itemId: string, updates: Partial<QuoteItem>) => void;
  removeQuoteItem: (quoteId: string, itemId: string) => void;
  deleteQuote: (id: string) => void;
}

type AppAction = 
  | { type: 'SWITCH_USER'; payload: string }
  | { type: 'TOGGLE_USER_ACCESS'; payload: string }
  | { type: 'ADD_PRODUCT'; payload: Product }
  | { type: 'UPDATE_PRODUCT'; payload: { id: string; updates: Partial<Product> } }
  | { type: 'DELETE_PRODUCT'; payload: string }
  | { type: 'ADD_CUSTOMER'; payload: Customer }
  | { type: 'UPDATE_CUSTOMER'; payload: { id: string; updates: Partial<Customer> } }
  | { type: 'DELETE_CUSTOMER'; payload: string }
  | { type: 'CREATE_QUOTE'; payload: Quote }
  | { type: 'UPDATE_QUOTE'; payload: { id: string; updates: Partial<Quote> } }
  | { type: 'ADD_QUOTE_ITEM'; payload: { quoteId: string; item: QuoteItem } }
  | { type: 'UPDATE_QUOTE_ITEM'; payload: { quoteId: string; itemId: string; updates: Partial<QuoteItem> } }
  | { type: 'REMOVE_QUOTE_ITEM'; payload: { quoteId: string; itemId: string } }
  | { type: 'DELETE_QUOTE'; payload: string }
  | { type: 'LOAD_STATE'; payload: AppState };

// Mock data for demo
const generateMockData = (): AppState => {
  const users: User[] = [
    {
      id: 'user1',
      name: 'John Smith',
      email: 'john@example.com',
      role: 'USER',
      isActive: true,
      createdAt: new Date('2024-01-01')
    },
    {
      id: 'user2',
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      role: 'USER',
      isActive: true,
      createdAt: new Date('2024-01-15')
    },
    {
      id: 'admin1',
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'SUPERADMIN',
      isActive: true,
      createdAt: new Date('2024-01-01')
    }
  ];

  const products: Product[] = [
    {
      id: 'prod1',
      userId: 'user1',
      name: 'Website Design',
      description: 'Custom website design and development',
      basePrice: 2500,
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-10')
    },
    {
      id: 'prod2',
      userId: 'user1',
      name: 'SEO Optimization',
      description: 'Complete SEO audit and optimization',
      basePrice: 800,
      createdAt: new Date('2024-01-12'),
      updatedAt: new Date('2024-01-12')
    },
    {
      id: 'prod3',
      userId: 'user2',
      name: 'Marketing Strategy',
      description: 'Comprehensive marketing strategy consultation',
      basePrice: 1200,
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-01-20')
    }
  ];

  const customers: Customer[] = [
    {
      id: 'cust1',
      userId: 'user1',
      name: 'Tech Startup Inc',
      email: 'contact@techstartup.com',
      company: 'Tech Startup Inc',
      createdAt: new Date('2024-01-05')
    },
    {
      id: 'cust2',
      userId: 'user1',
      name: 'Local Business',
      email: 'info@localbusiness.com',
      company: 'Local Business LLC',
      createdAt: new Date('2024-01-08')
    }
  ];

  const quotes: Quote[] = [
    {
      id: 'quote1',
      userId: 'user1',
      quoteNumber: 'Q-2024-001',
      status: 'PENDING',
      customerId: 'cust1',
      customerName: 'Tech Startup Inc',
      items: [
        {
          id: 'item1',
          productId: 'prod1',
          productName: 'Website Design',
          description: 'Custom website design and development',
          quantity: 1,
          unitPrice: 2500,
          totalPrice: 2500
        }
      ],
      subtotal: 2500,
      total: 2500,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15')
    }
  ];

  return {
    currentUser: users[0],
    users,
    products,
    customers,
    quotes
  };
};

const calculateQuoteTotal = (items: QuoteItem[]): { subtotal: number; total: number } => {
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const total = subtotal; // Add tax calculation here if needed
  return { subtotal, total };
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'LOAD_STATE':
      return action.payload;
      
    case 'SWITCH_USER':
      const user = state.users.find(u => u.id === action.payload);
      return user ? { ...state, currentUser: user } : state;
      
    case 'TOGGLE_USER_ACCESS':
      return {
        ...state,
        users: state.users.map(user =>
          user.id === action.payload
            ? { ...user, isActive: !user.isActive }
            : user
        )
      };
      
    case 'ADD_PRODUCT':
      return {
        ...state,
        products: [...state.products, action.payload]
      };
      
    case 'UPDATE_PRODUCT':
      return {
        ...state,
        products: state.products.map(product =>
          product.id === action.payload.id
            ? { ...product, ...action.payload.updates, updatedAt: new Date() }
            : product
        )
      };
      
    case 'DELETE_PRODUCT':
      return {
        ...state,
        products: state.products.filter(product => product.id !== action.payload)
      };
      
    case 'ADD_CUSTOMER':
      return {
        ...state,
        customers: [...state.customers, action.payload]
      };
      
    case 'UPDATE_CUSTOMER':
      return {
        ...state,
        customers: state.customers.map(customer =>
          customer.id === action.payload.id
            ? { ...customer, ...action.payload.updates }
            : customer
        )
      };
      
    case 'DELETE_CUSTOMER':
      return {
        ...state,
        customers: state.customers.filter(customer => customer.id !== action.payload)
      };
      
    case 'CREATE_QUOTE':
      return {
        ...state,
        quotes: [...state.quotes, action.payload]
      };
      
    case 'UPDATE_QUOTE':
      return {
        ...state,
        quotes: state.quotes.map(quote =>
          quote.id === action.payload.id
            ? { ...quote, ...action.payload.updates, updatedAt: new Date() }
            : quote
        )
      };
      
    case 'ADD_QUOTE_ITEM':
      return {
        ...state,
        quotes: state.quotes.map(quote => {
          if (quote.id === action.payload.quoteId) {
            const newItems = [...quote.items, action.payload.item];
            const totals = calculateQuoteTotal(newItems);
            return {
              ...quote,
              items: newItems,
              ...totals,
              updatedAt: new Date()
            };
          }
          return quote;
        })
      };
      
    case 'UPDATE_QUOTE_ITEM':
      return {
        ...state,
        quotes: state.quotes.map(quote => {
          if (quote.id === action.payload.quoteId) {
            const newItems = quote.items.map(item =>
              item.id === action.payload.itemId
                ? { 
                    ...item, 
                    ...action.payload.updates,
                    totalPrice: (action.payload.updates.quantity ?? item.quantity) * (action.payload.updates.unitPrice ?? item.unitPrice)
                  }
                : item
            );
            const totals = calculateQuoteTotal(newItems);
            return {
              ...quote,
              items: newItems,
              ...totals,
              updatedAt: new Date()
            };
          }
          return quote;
        })
      };
      
    case 'REMOVE_QUOTE_ITEM':
      return {
        ...state,
        quotes: state.quotes.map(quote => {
          if (quote.id === action.payload.quoteId) {
            const newItems = quote.items.filter(item => item.id !== action.payload.itemId);
            const totals = calculateQuoteTotal(newItems);
            return {
              ...quote,
              items: newItems,
              ...totals,
              updatedAt: new Date()
            };
          }
          return quote;
        })
      };
      
    case 'DELETE_QUOTE':
      return {
        ...state,
        quotes: state.quotes.filter(quote => quote.id !== action.payload)
      };
      
    default:
      return state;
  }
};

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, generateMockData());

  useEffect(() => {
    // Load state from localStorage if available
    const savedState = localStorage.getItem('quoteforge-state');
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        // Convert date strings back to Date objects
        const normalizedState = {
          ...parsedState,
          users: parsedState.users.map((u: any) => ({ ...u, createdAt: new Date(u.createdAt) })),
          products: parsedState.products.map((p: any) => ({ 
            ...p, 
            createdAt: new Date(p.createdAt),
            updatedAt: new Date(p.updatedAt)
          })),
          customers: parsedState.customers.map((c: any) => ({ ...c, createdAt: new Date(c.createdAt) })),
          quotes: parsedState.quotes.map((q: any) => ({ 
            ...q, 
            createdAt: new Date(q.createdAt),
            updatedAt: new Date(q.updatedAt)
          }))
        };
        dispatch({ type: 'LOAD_STATE', payload: normalizedState });
      } catch (error) {
        console.error('Error loading saved state:', error);
      }
    }
  }, []);

  useEffect(() => {
    // Save state to localStorage
    localStorage.setItem('quoteforge-state', JSON.stringify(state));
  }, [state]);

  const contextValue: AppContextType = {
    state,
    
    switchUser: (userId: string) => {
      dispatch({ type: 'SWITCH_USER', payload: userId });
    },
    
    toggleUserAccess: (userId: string) => {
      dispatch({ type: 'TOGGLE_USER_ACCESS', payload: userId });
    },
    
    addProduct: (productData) => {
      const product: Product = {
        ...productData,
        id: uuidv4(),
        userId: state.currentUser.id,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      dispatch({ type: 'ADD_PRODUCT', payload: product });
    },
    
    updateProduct: (id: string, updates: Partial<Product>) => {
      dispatch({ type: 'UPDATE_PRODUCT', payload: { id, updates } });
    },
    
    deleteProduct: (id: string) => {
      dispatch({ type: 'DELETE_PRODUCT', payload: id });
    },
    
    addCustomer: (customerData) => {
      const customer: Customer = {
        ...customerData,
        id: uuidv4(),
        userId: state.currentUser.id,
        createdAt: new Date()
      };
      dispatch({ type: 'ADD_CUSTOMER', payload: customer });
    },
    
    updateCustomer: (id: string, updates: Partial<Customer>) => {
      dispatch({ type: 'UPDATE_CUSTOMER', payload: { id, updates } });
    },
    
    deleteCustomer: (id: string) => {
      dispatch({ type: 'DELETE_CUSTOMER', payload: id });
    },
    
    createQuote: () => {
      const quoteNumber = `Q-${new Date().getFullYear()}-${String(state.quotes.length + 1).padStart(3, '0')}`;
      const quote: Quote = {
        id: uuidv4(),
        userId: state.currentUser.id,
        quoteNumber,
        status: 'DRAFT',
        items: [],
        subtotal: 0,
        total: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      dispatch({ type: 'CREATE_QUOTE', payload: quote });
      return quote.id;
    },
    
    updateQuote: (id: string, updates: Partial<Quote>) => {
      dispatch({ type: 'UPDATE_QUOTE', payload: { id, updates } });
    },
    
    addQuoteItem: (quoteId: string, productId: string, quantity = 1, customPrice?: number) => {
      const product = state.products.find(p => p.id === productId);
      if (!product) return;
      
      const unitPrice = customPrice ?? product.basePrice;
      const item: QuoteItem = {
        id: uuidv4(),
        productId,
        productName: product.name,
        description: product.description,
        quantity,
        unitPrice,
        totalPrice: quantity * unitPrice
      };
      
      dispatch({ type: 'ADD_QUOTE_ITEM', payload: { quoteId, item } });
    },
    
    updateQuoteItem: (quoteId: string, itemId: string, updates: Partial<QuoteItem>) => {
      dispatch({ type: 'UPDATE_QUOTE_ITEM', payload: { quoteId, itemId, updates } });
    },
    
    removeQuoteItem: (quoteId: string, itemId: string) => {
      dispatch({ type: 'REMOVE_QUOTE_ITEM', payload: { quoteId, itemId } });
    },
    
    deleteQuote: (id: string) => {
      dispatch({ type: 'DELETE_QUOTE', payload: id });
    }
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};