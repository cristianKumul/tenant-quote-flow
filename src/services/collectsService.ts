import { supabase } from "@/integrations/supabase/client";
import { Collect } from "../types";

export const collectsService = {
  // Get all collects for a specific quote
  async getCollectsByQuote(quoteId: string): Promise<Collect[]> {
    const { data, error } = await supabase
      .from('collects')
      .select('*')
      .eq('quote_id', quoteId)
      .order('collected_at', { ascending: false });

    if (error) {
      console.error('Error fetching collects:', error);
      throw new Error('Failed to fetch payment records');
    }

    return data.map(collect => ({
      id: collect.id,
      quoteId: collect.quote_id,
      userId: collect.user_id,
      amount: Number(collect.amount),
      paymentMethod: collect.payment_method,
      notes: collect.notes || undefined,
      collectedAt: new Date(collect.collected_at),
      createdAt: new Date(collect.created_at),
      updatedAt: new Date(collect.updated_at)
    }));
  },

  // Get all collects for the current user
  async getCollectsByUser(): Promise<Collect[]> {
    const { data, error } = await supabase
      .from('collects')
      .select('*')
      .order('collected_at', { ascending: false });

    if (error) {
      console.error('Error fetching user collects:', error);
      throw new Error('Failed to fetch payment records');
    }

    return data.map(collect => ({
      id: collect.id,
      quoteId: collect.quote_id,
      userId: collect.user_id,
      amount: Number(collect.amount),
      paymentMethod: collect.payment_method,
      notes: collect.notes || undefined,
      collectedAt: new Date(collect.collected_at),
      createdAt: new Date(collect.created_at),
      updatedAt: new Date(collect.updated_at)
    }));
  },

  // Add a new collect record
  async addCollect(collectData: Omit<Collect, 'id' | 'createdAt' | 'updatedAt'>): Promise<Collect> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('collects')
      .insert({
        quote_id: collectData.quoteId,
        user_id: user.id,
        amount: collectData.amount,
        payment_method: collectData.paymentMethod,
        notes: collectData.notes || null,
        collected_at: collectData.collectedAt.toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding collect:', error);
      throw new Error('Failed to record payment');
    }

    return {
      id: data.id,
      quoteId: data.quote_id,
      userId: data.user_id,
      amount: Number(data.amount),
      paymentMethod: data.payment_method,
      notes: data.notes || undefined,
      collectedAt: new Date(data.collected_at),
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  },

  // Update a collect record
  async updateCollect(id: string, updates: Partial<Omit<Collect, 'id' | 'quoteId' | 'userId' | 'createdAt' | 'updatedAt'>>): Promise<Collect> {
    const updateData: any = {};
    
    if (updates.amount !== undefined) updateData.amount = updates.amount;
    if (updates.paymentMethod !== undefined) updateData.payment_method = updates.paymentMethod;
    if (updates.notes !== undefined) updateData.notes = updates.notes;
    if (updates.collectedAt !== undefined) updateData.collected_at = updates.collectedAt.toISOString();

    const { data, error } = await supabase
      .from('collects')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating collect:', error);
      throw new Error('Failed to update payment record');
    }

    return {
      id: data.id,
      quoteId: data.quote_id,
      userId: data.user_id,
      amount: Number(data.amount),
      paymentMethod: data.payment_method,
      notes: data.notes || undefined,
      collectedAt: new Date(data.collected_at),
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  },

  // Delete a collect record
  async deleteCollect(id: string): Promise<void> {
    const { error } = await supabase
      .from('collects')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting collect:', error);
      throw new Error('Failed to delete payment record');
    }
  }
};