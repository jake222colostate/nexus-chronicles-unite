import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import SubscriptionCTA from '../../components/subscription/SubscriptionCTA';
import { palette } from '../../theme/palette';
import { radius, spacing } from '../../theme/layout';
import { typography } from '../../theme/typography';

const ProfileScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}> 
          <View>
            <Text style={styles.name}>Your Name</Text>
            <Text style={styles.subtext}>@username</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.editButton} activeOpacity={0.9}>
          <Text style={styles.editLabel}>Edit Profile</Text>
        </TouchableOpacity>

        <SubscriptionCTA location="profile" />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  name: {
    color: palette.textPrimary,
    fontSize: typography.title,
    fontWeight: '700',
  },
  subtext: {
    color: palette.textMuted,
    fontSize: typography.body,
  },
  editButton: {
    backgroundColor: palette.accent,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    alignItems: 'center',
  },
  editLabel: {
    color: palette.textPrimary,
    fontWeight: '700',
    fontSize: typography.subtitle,
  },
});

export default ProfileScreen;
