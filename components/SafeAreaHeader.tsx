import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

interface SafeAreaHeaderProps {
  title: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
}

export default function SafeAreaHeader({ 
  title, 
  showBackButton = false, 
  onBackPress 
}: SafeAreaHeaderProps) {
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
      <View style={styles.container}>
        {showBackButton && (
          <Pressable 
            style={styles.backButton} 
            onPress={onBackPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="chevron-back" size={28} color={theme.primary} />
          </Pressable>
        )}
        <Text style={[
          styles.title, 
          { color: theme.text },
          showBackButton && styles.titleWithBackButton
        ]}>{title}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    borderBottomWidth: 1,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
  },
  titleWithBackButton: {
    marginLeft: 8,
  },
  backButton: {
    padding: 4,
  },
});
