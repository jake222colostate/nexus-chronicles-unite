import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import useSubscriptionStatus from '../../hooks/useSubscriptionStatus';
import { startManageSubscription, startUpgradeFlow } from '../../lib/subscriptionActions';
import { palette } from '../../theme/palette';
import { radius, spacing } from '../../theme/layout';
import { typography } from '../../theme/typography';

const UpgradePlanScreen: React.FC = () => {
  const { planId, planLabel } = useSubscriptionStatus();

  const renderBadge = (label: string) => (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{label}</Text>
    </View>
  );

  const renderCard = (
    plan: 'plus' | 'pro',
    options: {
      title: string;
      price: string;
      tagline: string;
      bullets: string[];
      highlight?: boolean;
    },
  ) => {
    const isCurrent = planId === plan;
    const cardContent = (
      <View style={[styles.cardInner, options.highlight && styles.cardHighlighted]}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{options.title}</Text>
          {options.highlight && renderBadge('Most popular')}
        </View>
        <Text style={styles.price}>{options.price}</Text>
        <Text style={styles.tagline}>{options.tagline}</Text>
        <View style={styles.bulletList}>
          {options.bullets.map((bullet) => (
            <View style={styles.bulletRow} key={bullet}>
              <Text style={styles.bulletIcon}>•</Text>
              <Text style={styles.bulletText}>{bullet}</Text>
            </View>
          ))}
        </View>
        <TouchableOpacity
          style={[styles.ctaButton, isCurrent && styles.ctaButtonDisabled]}
          disabled={isCurrent}
          onPress={() => startUpgradeFlow(plan)}
          activeOpacity={0.9}
        >
          <Text style={styles.ctaLabel}>{isCurrent ? 'Current plan' : `Choose ${options.title}`}</Text>
        </TouchableOpacity>
      </View>
    );

    if (options.highlight) {
      return (
        <LinearGradient
          key={plan}
          colors={[palette.cardGradientStart, palette.cardGradientEnd]}
          style={styles.card}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {cardContent}
        </LinearGradient>
      );
    }

    return (
      <View key={plan} style={[styles.card, styles.outlinedCard]}>
        {cardContent}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {planId !== 'free' && (
          <View style={styles.currentPlanPill}>
            <Text style={styles.currentPlanText}>{`You’re currently on ${planLabel}`}</Text>
          </View>
        )}

        <Text style={styles.title}>Upgrade your account</Text>
        <Text style={styles.subtitle}>Get more visibility and more posts per day.</Text>

        {renderCard('plus', {
          title: 'Premium',
          price: '$8 / month',
          tagline: 'Boost your visibility',
          bullets: ['3 Live Posts per day', '10 Feed Posts per day', 'Increased visibility vs free users'],
        })}

        {renderCard('pro', {
          title: 'Elite',
          price: '$20 / month',
          tagline: 'Maximum exposure',
          bullets: ['10 Live Posts per day', 'Up to 50 Feed Posts per day', 'Top visibility priority'],
          highlight: true,
        })}

        {planId !== 'free' && (
          <TouchableOpacity style={styles.manageButton} onPress={startManageSubscription}>
            <Text style={styles.manageLabel}>Manage subscription</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.background,
  },
  container: {
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  title: {
    color: palette.textPrimary,
    fontSize: typography.title,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  subtitle: {
    color: palette.textMuted,
    fontSize: typography.subtitle,
    marginBottom: spacing.xl,
  },
  card: {
    borderRadius: radius.xl,
    padding: 1,
    backgroundColor: palette.border,
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  outlinedCard: {
    backgroundColor: palette.surface,
  },
  cardInner: {
    backgroundColor: palette.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
  },
  cardHighlighted: {
    backgroundColor: 'transparent',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  badge: {
    backgroundColor: palette.accent,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
  },
  badgeText: {
    color: palette.textPrimary,
    fontWeight: '700',
    fontSize: typography.caption,
  },
  cardTitle: {
    color: palette.textPrimary,
    fontSize: typography.subtitle,
    fontWeight: '700',
  },
  price: {
    color: palette.textPrimary,
    fontSize: typography.title,
    fontWeight: '800',
    marginBottom: spacing.xs,
  },
  tagline: {
    color: palette.textMuted,
    fontSize: typography.body,
    marginBottom: spacing.md,
  },
  bulletList: {
    marginBottom: spacing.lg,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  bulletIcon: {
    color: palette.accent,
    marginRight: spacing.sm,
    fontSize: typography.subtitle,
  },
  bulletText: {
    color: palette.textPrimary,
    fontSize: typography.body,
  },
  ctaButton: {
    backgroundColor: palette.accent,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    alignItems: 'center',
  },
  ctaButtonDisabled: {
    backgroundColor: palette.border,
  },
  ctaLabel: {
    color: palette.textPrimary,
    fontWeight: '700',
    fontSize: typography.subtitle,
  },
  manageButton: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  manageLabel: {
    color: palette.textMuted,
    fontSize: typography.body,
    textDecorationLine: 'underline',
  },
  currentPlanPill: {
    alignSelf: 'flex-start',
    backgroundColor: palette.mutedSurface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.lg,
    marginBottom: spacing.lg,
  },
  currentPlanText: {
    color: palette.textPrimary,
    fontSize: typography.caption,
    fontWeight: '600',
  },
});

export default UpgradePlanScreen;
