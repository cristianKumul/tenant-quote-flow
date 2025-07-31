import { supabase } from "@/integrations/supabase/client";
import { Quote, QuoteStatus } from "../types";

export const quotesService = {
  // Get all quotes for the current user
  async getQuotes(): Promise<Quote[]> {
    const { data, error } = await supabase
      .from('quotes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching quotes:', error);
      throw new Error('Failed to fetch quotes');
    }

    return data.map(quote => ({
      id: quote.id,
      userId: quote.user_id,
      quoteNumber: quote.quote_number,
      status: quote.status as QuoteStatus,
      customerId: quote.customer_id || undefined,
      customerName: quote.customer_name || undefined,
      items: [], // Quote items will be loaded separately
      subtotal: Number(quote.subtotal),
      total: Number(quote.total),
      totalPaid: Number(quote.total_paid || 0),
      notes: quote.notes || undefined,
      createdAt: new Date(quote.created_at),
      updatedAt: new Date(quote.updated_at)
    }));
  },

  // Update a quote
  async updateQuote(id: string, updates: Partial<Quote>): Promise<Quote> {
    const updateData: any = {};
    
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.customerId !== undefined) updateData.customer_id = updates.customerId;
    if (updates.customerName !== undefined) updateData.customer_name = updates.customerName;
    if (updates.subtotal !== undefined) updateData.subtotal = updates.subtotal;
    if (updates.total !== undefined) updateData.total = updates.total;
    if (updates.totalPaid !== undefined) updateData.total_paid = updates.totalPaid;
    if (updates.notes !== undefined) updateData.notes = updates.notes;

    const { data, error } = await supabase
      .from('quotes')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating quote:', error);
      throw new Error('Failed to update quote');
    }

    return {
      id: data.id,
      userId: data.user_id,
      quoteNumber: data.quote_number,
      status: data.status as QuoteStatus,
      customerId: data.customer_id || undefined,
      customerName: data.customer_name || undefined,
      items: [], // Quote items will be loaded separately
      subtotal: Number(data.subtotal),
      total: Number(data.total),
      totalPaid: Number(data.total_paid || 0),
      notes: data.notes || undefined,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }
};