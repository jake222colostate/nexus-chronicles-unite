import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import SubscriptionCTA from '../../components/subscription/SubscriptionCTA';
import { palette } from '../../theme/palette';
import { radius, spacing } from '../../theme/layout';
import { typography } from '../../theme/typography';

const miniPlanBullets = (bullets: string[]) => (
  <View style={styles.bulletList}>
    {bullets.map((bullet) => (
      <View key={bullet} style={styles.bulletRow}>
        <Text style={styles.bulletIcon}>•</Text>
        <Text style={styles.bulletText}>{bullet}</Text>
      </View>
    ))}
  </View>
);

const LikesScreen: React.FC = () => {
  const likes = [] as string[]; // placeholder data
  const hasLikes = likes.length > 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {hasLikes ? (
          <Text style={styles.placeholderText}>Here would be your likes list.</Text>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No likes yet</Text>
            <Text style={styles.emptySubtitle}>Upgrade to get seen by more people.</Text>

            <View style={styles.miniCardRow}>
              <View style={[styles.miniCard, styles.cardSpacing]}>
                <Text style={styles.miniTitle}>Premium – $8/month</Text>
                {miniPlanBullets(['3 live posts daily', '10 feed posts daily', 'Extra visibility'])}
              </View>
              <View style={[styles.miniCard, styles.miniCardHighlighted]}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>Most popular</Text>
                </View>
                <Text style={styles.miniTitle}>Elite – $20/month</Text>
                {miniPlanBullets(['10 live posts daily', 'Up to 50 feed posts', 'Top priority'])}
              </View>
            </View>

            <SubscriptionCTA location="likes" />
          </View>
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
  },
  placeholderText: {
    color: palette.textMuted,
  },
  emptyState: {
    paddingVertical: spacing.xl,
  },
  emptyTitle: {
    color: palette.textPrimary,
    fontSize: typography.title,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    color: palette.textMuted,
    marginBottom: spacing.lg,
    fontSize: typography.subtitle,
  },
  miniCardRow: {
    flexDirection: 'row',
  },
  miniCard: {
    flex: 1,
    backgroundColor: palette.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: palette.border,
  },
  cardSpacing: {
    marginRight: spacing.md,
  },
  miniCardHighlighted: {
    borderColor: palette.accent,
  },
  miniTitle: {
    color: palette.textPrimary,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  bulletList: {
    marginBottom: spacing.sm,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  bulletIcon: {
    color: palette.accent,
    marginRight: spacing.xs,
  },
  bulletText: {
    color: palette.textMuted,
    fontSize: typography.body,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: palette.accent,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
    marginBottom: spacing.xs,
  },
  badgeText: {
    color: palette.textPrimary,
    fontSize: typography.caption,
    fontWeight: '700',
  },
});

export default LikesScreen;
