import { View, Text, StyleSheet } from 'react-native';

export default function HistoryTab() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>History Tab - Coming Soon!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  text: {
    fontSize: 18,
    color: '#6b7280',
  },
});