
import { supabase } from '../supabaseClient';

export const POINT_VALUES = {
  LESSON_COMPLETE: 10,
  QUIZ_PASS: 20,
  RAG_CHAT: 5,
  MENTOR_CONTENT_CREATION: 50
};

export async function awardPoints(userId: string, amount: number, reason: string) {
  try {
    // 1. Log the points
    await supabase.from('points_logs').insert({
      user_id: userId,
      points: amount,
      reason: reason
    });

    // 2. Update user balance
    const { data: user } = await supabase
      .from('users')
      .select('points')
      .eq('id', userId)
      .single();

    const newTotal = (Number(user?.points) || 0) + amount;
    await supabase.from('users').update({ points: newTotal }).eq('id', userId);

    // 3. Handle Referral Commission (15% Level 1)
    const { data: ref1 } = await supabase
      .from('referral_tree')
      .select('referrer_id')
      .eq('user_id', userId)
      .single();

    if (ref1?.referrer_id) {
      const commission1 = amount * 0.15;
      await awardPoints(ref1.referrer_id, commission1, `Referral L1: ${reason}`);

      // 4. Level 2 (5%)
      const { data: ref2 } = await supabase
        .from('referral_tree')
        .select('referrer_id')
        .eq('user_id', ref1.referrer_id)
        .single();
      
      if (ref2?.referrer_id) {
        const commission2 = amount * 0.05;
        await awardPoints(ref2.referrer_id, commission2, `Referral L2: ${reason}`);
      }
    }
  } catch (error) {
    console.error("Points award error:", error);
  }
}
