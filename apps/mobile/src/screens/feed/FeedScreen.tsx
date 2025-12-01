import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import SubscriptionCTA from '../../components/subscription/SubscriptionCTA';
import { palette } from '../../theme/palette';
import { spacing, radius } from '../../theme/layout';
import { typography } from '../../theme/typography';

const FeedScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Feed</Text>

        <View style={styles.exploreSection}>
          <Text style={styles.sectionTitle}>Explore nearby</Text>
          <Text style={styles.sectionSubtitle}>See people who are close and active right now.</Text>
          <View style={styles.placeholderCard}>
            <Text style={styles.placeholderText}>Explore content placeholder</Text>
          </View>
        </View>

        <SubscriptionCTA location="feed" />
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
  title: {
    color: palette.textPrimary,
    fontSize: typography.title,
    fontWeight: '700',
    marginBottom: spacing.lg,
  },
  exploreSection: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    color: palette.textPrimary,
    fontSize: typography.subtitle,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    color: palette.textMuted,
    marginBottom: spacing.md,
  },
  placeholderCard: {
    backgroundColor: palette.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: palette.border,
  },
  placeholderText: {
    color: palette.textMuted,
  },
});

export default FeedScreen;
