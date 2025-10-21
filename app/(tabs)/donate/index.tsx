import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// Import tab components
import GiveTab from './give';
import HistoryTab from './history';
import ManageTab from './manage';

type TabType = 'give' | 'history' | 'manage';

export default function DonateIndex() {
  const [activeTab, setActiveTab] = useState<TabType>('give');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="heart" size={32} color="#fff" />
        <Text style={styles.headerTitle}>Donate</Text>
        <Text style={styles.headerSubtitle}>Support Al Ansar</Text>
      </View>

      {/* Custom Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'give' && styles.tabActive]}
          onPress={() => setActiveTab('give')}
        >
          <Ionicons 
            name="heart" 
            size={20} 
            color={activeTab === 'give' ? '#1e3a8a' : '#9ca3af'} 
          />
          <Text style={[styles.tabText, activeTab === 'give' && styles.tabTextActive]}>
            Give
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.tabActive]}
          onPress={() => setActiveTab('history')}
        >
          <Ionicons 
            name="list" 
            size={20} 
            color={activeTab === 'history' ? '#1e3a8a' : '#9ca3af'} 
          />
          <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>
            History
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'manage' && styles.tabActive]}
          onPress={() => setActiveTab('manage')}
        >
          <Ionicons 
            name="settings" 
            size={20} 
            color={activeTab === 'manage' ? '#1e3a8a' : '#9ca3af'} 
          />
          <Text style={[styles.tabText, activeTab === 'manage' && styles.tabTextActive]}>
            Manage
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <View style={styles.content}>
        {activeTab === 'give' && <GiveTab />}
        {activeTab === 'history' && <HistoryTab />}
        {activeTab === 'manage' && <ManageTab />}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e3a8a',
  },
  header: {
    backgroundColor: '#1e3a8a',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 12,
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#93c5fd',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#1e3a8a',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9ca3af',
    marginTop: 4,
  },
  tabTextActive: {
    color: '#1e3a8a',
  },
  content: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});