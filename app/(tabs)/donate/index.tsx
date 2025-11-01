import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Import tab components
import PatternOverlay from '../../../components/PatternOverlay';
import PillToggle from '../../../components/ui/PillToggle';
import { Theme } from '../../../constants/theme';
import GiveTab from './give';
import HistoryTab from './history';
import ManageTab from './manage';

type TabType = 'give' | 'history' | 'manage';

export default function DonateIndex() {
  const [activeTab, setActiveTab] = useState<TabType>('give');

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header with Gradient */}
      <LinearGradient
        colors={[Theme.colors.brand.navy[800], Theme.colors.brand.navy[700], Theme.colors.brand.navy[900]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <PatternOverlay
          style={styles.patternOverlay}
          variant="stars"
          opacity={0.05}
          tileSize={28}
          color="rgba(255,255,255,0.7)"
        />
        <SafeAreaView edges={['top']}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Donate</Text>
            <Text style={styles.headerSubtitle}>Support Al Ansar</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Tab Bar */}
      <PillToggle
        options={[
          { key: 'give', label: 'Give' },
          { key: 'history', label: 'History' },
          { key: 'manage', label: 'Manage' },
        ]}
        value={activeTab}
        onChange={(key) => setActiveTab(key as TabType)}
        style={{ marginTop: -12, marginBottom: 12 }}
      />

      {/* Tab Content */}
      <View style={styles.content}>
        {activeTab === 'give' && <GiveTab />}
        {activeTab === 'history' && <HistoryTab />}
        {activeTab === 'manage' && <ManageTab />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.surface.muted,
  },
  headerGradient: {
    paddingBottom: Theme.spacing.xl,
    borderBottomLeftRadius: Theme.radius.xl,
    borderBottomRightRadius: Theme.radius.xl,
    ...Theme.shadow.header,
  },
  patternOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  header: {
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.md,
    paddingBottom: Theme.spacing.sm,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: Theme.colors.text.inverse,
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 16,
    color: Theme.colors.text.subtle,
  },
  content: {
    flex: 1,
    backgroundColor: Theme.colors.surface.muted,
  },
});