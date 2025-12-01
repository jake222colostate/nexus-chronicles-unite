import { useMemo } from 'react';

type PlanId = 'free' | 'plus' | 'pro';

export interface SubscriptionStatus {
  planId: PlanId;
  planLabel: string;
  isPaid: boolean;
  isPro: boolean;
}

/**
 * Placeholder hook to represent the user's subscription status.
 * Update the hardcoded values here once backend wiring is available.
 */
export const useSubscriptionStatus = (): SubscriptionStatus => {
  // TODO: replace with real query to backend/Stripe.
  const mockPlan: PlanId = 'free';

  return useMemo(() => {
    const planLabelMap: Record<PlanId, string> = {
      free: 'Free',
      plus: 'Premium',
      pro: 'Elite',
    };

    return {
      planId: mockPlan,
      planLabel: planLabelMap[mockPlan],
      isPaid: mockPlan !== 'free',
      isPro: mockPlan === 'pro',
    };
  }, [mockPlan]);
};

export default useSubscriptionStatus;
