import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import useSubscriptionStatus from '../../hooks/useSubscriptionStatus';
import { startManageSubscription } from '../../lib/subscriptionActions';
import { palette } from '../../theme/palette';
import { spacing, radius } from '../../theme/layout';
import { typography } from '../../theme/typography';

type SubscriptionCTALocation = 'profile' | 'feed' | 'likes';

interface SubscriptionCTAProps {
  location: SubscriptionCTALocation;
}

export const SubscriptionCTA: React.FC<SubscriptionCTAProps> = ({ location }) => {
  const navigation = useNavigation<any>();
  const { planId } = useSubscriptionStatus();

  const isFree = planId === 'free';
  const isPaid = planId === 'plus' || planId === 'pro';

  const handlePress = () => {
    if (isFree) {
      navigation.navigate('UpgradePlan');
      return;
    }

    startManageSubscription();
  };

  const captionCopy = isPaid
    ? `You’re on ${planId === 'plus' ? 'Premium' : 'Elite'}`
    : location === 'likes'
    ? 'See more attention with a boost'
    : 'Unlock more visibility';

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, isFree ? styles.primaryButton : styles.destructiveButton]}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        <Text style={styles.buttonLabel}>{isFree ? 'Upgrade account' : 'Cancel / Downgrade'}</Text>
      </TouchableOpacity>
      <Text style={[styles.caption, isPaid && styles.captionPaid]}>{captionCopy}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: spacing.md,
  },
  button: {
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: palette.accent,
  },
  destructiveButton: {
    backgroundColor: palette.destructive,
  },
  buttonLabel: {
    color: palette.textPrimary,
    fontWeight: '600',
    fontSize: typography.subtitle,
  },
  caption: {
    marginTop: spacing.xs,
    color: palette.textMuted,
    fontSize: typography.caption,
    textAlign: 'center',
  },
  captionPaid: {
    color: palette.textPrimary,
  },
});

export default SubscriptionCTA;
