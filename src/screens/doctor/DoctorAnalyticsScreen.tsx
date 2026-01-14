import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const DoctorAnalyticsScreen = () => {
  return (
    <View style={styles.container}>
      <Text>Doctor Analytics Screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default DoctorAnalyticsScreen;