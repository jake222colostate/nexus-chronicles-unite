import { Alert } from 'react-native';

export const startUpgradeFlow = (planId: 'plus' | 'pro') => {
  console.log(`Starting upgrade flow for plan: ${planId}`);
  Alert.alert('Upgrade', `Start upgrade flow for ${planId === 'plus' ? 'Premium' : 'Elite'}`);
};

export const startManageSubscription = () => {
  console.log('Opening manage subscription portal');
  Alert.alert('Manage subscription', 'Open manage subscription/portal here');
};
