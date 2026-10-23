import React from 'react';
import { StyleSheet, Text, View, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { UserRole } from '@student-care/shared-types';

export default function App() {
  const currentRole: UserRole = 'PARENT';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.content}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>PARENT PORTAL MOBILE</Text>
        </View>

        <Text style={styles.title}>Student Care</Text>
        <Text style={styles.subtitle}>Secure Mobile Portal for Parents & Guardians</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Foundation Ready</Text>
          <Text style={styles.cardBody}>
            Role Target: {currentRole}
            {'\n'}
            Multi-Tenant Isolation: Active{'\n'}
            Default Timezone: Asia/Colombo
          </Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Upcoming capabilities: Real-time biometric attendance alerts, report cards, fee
            tracking, and direct school notices.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderColor: 'rgba(99, 102, 241, 0.35)',
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginBottom: 16,
  },
  badgeText: {
    color: '#c7d2fe',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    marginBottom: 32,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#1e293b',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    width: '100%',
    marginBottom: 20,
  },
  cardTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  cardBody: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 22,
  },
  infoBox: {
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    padding: 16,
    borderRadius: 12,
    width: '100%',
  },
  infoText: {
    color: '#64748b',
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
});
