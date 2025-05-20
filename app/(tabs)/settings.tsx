import React from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';
import { useOxy } from '@oxyhq/services';
import SafeAreaHeader from '../../components/SafeAreaHeader';

export default function SettingsScreen() {
  const { theme, isDark, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const { user, showBottomSheet } = useOxy();

  const handleClearAccounts = async () => {
    Alert.alert(
      t('clearConfirmTitle'),
      t('clearConfirmMessage'),
      [
        {
          text: t('cancel'),
          style: 'cancel',
        },
        {
          text: t('clear'),
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('accounts');
          },
        },
      ]
    );
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'es' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <SafeAreaHeader title={t('settings')} />

      <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Pressable
          style={styles.option}
          onPress={() => showBottomSheet?.('SignIn')}
        >
          <View style={styles.optionContent}>
            <Ionicons
              name={user ? "person-circle-outline" : "log-in-outline"}
              size={24}
              color={theme.primary}
            />
            <Text style={[styles.optionText, { color: theme.text }]}>
              {user?.username
                ? user.username
                : t('signIn')}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={theme.textSecondary} />
        </Pressable>

        <View style={[styles.separator, { backgroundColor: theme.border }]} />

        <Pressable
          style={styles.option}
          onPress={toggleTheme}
        >
          <View style={styles.optionContent}>
            <Ionicons name={isDark ? "moon" : "sunny"} size={24} color={theme.primary} />
            <Text style={[styles.optionText, { color: theme.text }]}>
              {isDark ? 'Dark Mode' : 'Light Mode'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={theme.textSecondary} />
        </Pressable>

        <View style={[styles.separator, { backgroundColor: theme.border }]} />

        <Pressable
          style={styles.option}
          onPress={toggleLanguage}
        >
          <View style={styles.optionContent}>
            <Ionicons name="language" size={24} color={theme.primary} />
            <Text style={[styles.optionText, { color: theme.text }]}>
              {i18n.language === 'en' ? 'English' : 'Español'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={theme.textSecondary} />
        </Pressable>

        <View style={[styles.separator, { backgroundColor: theme.border }]} />

        <Pressable
          style={styles.option}
          onPress={() => router.push('/sync')}
        >
          <View style={styles.optionContent}>
            <Ionicons name="cloud-outline" size={24} color={theme.primary} />
            <Text style={[styles.optionText, { color: theme.text }]}>
              {t('syncAccounts')}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={theme.textSecondary} />
        </Pressable>

        <View style={[styles.separator, { backgroundColor: theme.border }]} />

        <Pressable
          style={styles.option}
          onPress={handleClearAccounts}
        >
          <View style={styles.optionContent}>
            <Ionicons name="trash-outline" size={24} color={theme.danger} />
            <Text style={[styles.optionText, { color: theme.danger }]}>
              {t('clearAllAccounts')}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={theme.textSecondary} />
        </Pressable>
      </View>

      <View style={styles.footer}>
        <Text style={[styles.version, { color: theme.textSecondary }]}>{t('version')} 1.0.0</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginTop: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    marginLeft: 12,
  },
  separator: {
    height: 1,
    marginLeft: 16,
  },
  footer: {
    padding: 16,
    alignItems: 'center',
  },
  version: {
    fontSize: 14,
  },
});