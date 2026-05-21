import { supabase } from '@/integrations/supabase/client';

export type BattleCodeMode = 'esports' | 'sports';

export interface BattleCode {
  id: string;
  code: string;
  bonus_amount: number;
  max_uses: number;
  current_uses: number;
  is_active: boolean;
  expires_at: string | null;
  created_by: string | null;
  created_by_user_id?: string | null;
  mode: BattleCodeMode;
  created_at: string;
  updated_at: string;
}

export interface BattleCodeRedemption {
  id: string;
  code_id: string;
  user_id: string;
  amount: number;
  mode: BattleCodeMode;
  redeemed_at: string;
}

export const battleCodeService = {
  async getAllCodes(mode: BattleCodeMode): Promise<BattleCode[]> {
    const { data, error } = await supabase
      .from('battle_codes')
      .select('*')
      .eq('mode', mode)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching battle codes:', error);
      throw error;
    }
    return data as BattleCode[];
  },

  async createCode(code: Omit<BattleCode, 'id' | 'current_uses' | 'created_at' | 'updated_at'>): Promise<BattleCode> {
    const { data, error } = await supabase
      .from('battle_codes')
      .insert([code])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating battle code:', error);
      throw error;
    }
    return data as BattleCode;
  },

  async updateCode(id: string, updates: Partial<BattleCode>): Promise<BattleCode> {
    const { data, error } = await supabase
      .from('battle_codes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating battle code:', error);
      throw error;
    }
    return data as BattleCode;
  },

  async deleteCode(id: string): Promise<void> {
    const { error } = await supabase
      .from('battle_codes')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting battle code:', error);
      throw error;
    }
  },

  async redeemCode(code: string, _userId: string, mode: BattleCodeMode): Promise<{ success: boolean; amount?: number; message: string }> {
    const { data, error } = await supabase.rpc('redeem_battle_code', {
      _code: code,
      _mode: mode,
    });
    if (error) {
      console.error('Error redeeming battle code:', error);
      return { success: false, message: error.message || 'Failed to redeem code' };
    }
    const result = data as { success: boolean; amount?: number; message: string };
    return result;
  },

  async getRedemptions(codeId: string): Promise<BattleCodeRedemption[]> {
    const { data, error } = await supabase
      .from('battle_code_redemptions')
      .select('*')
      .eq('code_id', codeId)
      .order('redeemed_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching redemptions:', error);
      return [];
    }
    return data as BattleCodeRedemption[];
  }
};
