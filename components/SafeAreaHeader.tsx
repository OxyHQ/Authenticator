import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';

interface SafeAreaHeaderProps {
  title: string;
}

export default function SafeAreaHeader({ title }: SafeAreaHeaderProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View 
      style={[
        styles.header, 
        { 
          backgroundColor: theme.surface,
          borderBottomColor: theme.border,
          paddingTop: insets.top,
        }
      ]}
    >
      <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginHorizontal: 16,
    marginVertical: 12,
  },
});
