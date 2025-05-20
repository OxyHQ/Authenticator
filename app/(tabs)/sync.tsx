import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useOxy } from '@oxyhq/services';

interface Account {
    secret: string;
    issuer: string;
    account: string;
}

export default function SyncScreen() {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const { user, showBottomSheet, api } = useOxy();

    const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
    const [lastSynced, setLastSynced] = useState<Date | null>(null);
    const [accounts, setAccounts] = useState<Account[]>([]);

    // Load local accounts and last sync time
    useEffect(() => {
        const loadData = async () => {
            try {
                const storedAccounts = await AsyncStorage.getItem('accounts');
                if (storedAccounts) {
                    setAccounts(JSON.parse(storedAccounts));
                }

                const lastSyncTime = await AsyncStorage.getItem('lastSyncTime');
                if (lastSyncTime) {
                    setLastSynced(new Date(lastSyncTime));
                }
            } catch (error) {
                console.error('Error loading data:', error);
            }
        };

        loadData();
    }, []);

    // Function to sync accounts to Oxy cloud
    const syncToCloud = async () => {
        if (!user) {
            showBottomSheet?.('SignIn');
            return;
        }

        setSyncStatus('syncing');
        try {
            const storedAccounts = await AsyncStorage.getItem('accounts');
            const accounts = storedAccounts ? JSON.parse(storedAccounts) : [];

            // Upload accounts to Oxy cloud
            await api?.post('/user/data/authenticator', {
                accounts: accounts
            });

            const now = new Date();
            await AsyncStorage.setItem('lastSyncTime', now.toISOString());
            setLastSynced(now);

            setSyncStatus('success');

            Alert.alert(
                t('syncSuccessTitle'),
                t('syncSuccessMessage'),
                [{ text: 'OK' }]
            );
        } catch (error) {
            console.error('Error syncing to cloud:', error);
            setSyncStatus('error');

            Alert.alert(
                t('syncErrorTitle'),
                t('syncErrorMessage'),
                [{ text: 'OK' }]
            );
        }
    };

    // Function to retrieve accounts from Oxy cloud
    const retrieveFromCloud = async () => {
        if (!user) {
            showBottomSheet?.('SignIn');
            return;
        }

        setSyncStatus('syncing');
        try {
            // Get accounts from Oxy cloud
            const response = await api?.get('/user/data/authenticator');

            if (response?.data?.accounts) {
                // Confirm overwrite if there are local accounts
                if (accounts.length > 0) {
                    Alert.alert(
                        t('retrieveConfirmTitle'),
                        t('retrieveConfirmMessage'),
                        [
                            {
                                text: t('cancel'),
                                style: 'cancel',
                                onPress: () => setSyncStatus('idle')
                            },
                            {
                                text: t('confirm'),
                                onPress: async () => {
                                    await AsyncStorage.setItem('accounts', JSON.stringify(response.data.accounts));
                                    setAccounts(response.data.accounts);

                                    const now = new Date();
                                    await AsyncStorage.setItem('lastSyncTime', now.toISOString());
                                    setLastSynced(now);

                                    setSyncStatus('success');

                                    Alert.alert(
                                        t('retrieveSuccessTitle'),
                                        t('retrieveSuccessMessage'),
                                        [{ text: 'OK' }]
                                    );
                                }
                            }
                        ]
                    );
                } else {
                    // No local accounts, just save the cloud accounts
                    await AsyncStorage.setItem('accounts', JSON.stringify(response.data.accounts));
                    setAccounts(response.data.accounts);

                    const now = new Date();
                    await AsyncStorage.setItem('lastSyncTime', now.toISOString());
                    setLastSynced(now);

                    setSyncStatus('success');

                    Alert.alert(
                        t('retrieveSuccessTitle'),
                        t('retrieveSuccessMessage'),
                        [{ text: 'OK' }]
                    );
                }
            } else {
                setSyncStatus('idle');
                Alert.alert(
                    t('noCloudDataTitle'),
                    t('noCloudDataMessage'),
                    [{ text: 'OK' }]
                );
            }
        } catch (error) {
            console.error('Error retrieving from cloud:', error);
            setSyncStatus('error');

            Alert.alert(
                t('retrieveErrorTitle'),
                t('retrieveErrorMessage'),
                [{ text: 'OK' }]
            );
        }
    };

    const formatLastSynced = () => {
        if (!lastSynced) return t('neverSynced');

        // Format the date for display
        return lastSynced.toLocaleString();
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
                <Text style={[styles.title, { color: theme.text }]}>{t('syncAccounts')}</Text>
            </View>

            <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                {!user ? (
                    <View style={styles.signInContainer}>
                        <Ionicons name="cloud-offline-outline" size={64} color={theme.textSecondary} />
                        <Text style={[styles.signInText, { color: theme.text }]}>
                            {t('signInToSync')}
                        </Text>
                        <Pressable
                            style={[styles.button, { backgroundColor: theme.primary }]}
                            onPress={() => showBottomSheet?.('SignIn')}
                        >
                            <Text style={[styles.buttonText, { color: '#fff' }]}>
                                {t('signIn')}
                            </Text>
                        </Pressable>
                    </View>
                ) : (
                    <>
                        <View style={styles.userInfo}>
                            <Ionicons name="person-circle-outline" size={48} color={theme.primary} />
                            <View style={styles.userTextContainer}>
                                <Text style={[styles.userName, { color: theme.text }]}>{user.username}</Text>
                                <Text style={[styles.syncStatus, { color: theme.textSecondary }]}>
                                    {t('lastSynced')}: {formatLastSynced()}
                                </Text>
                                <Text style={[styles.accountCount, { color: theme.textSecondary }]}>
                                    {t('localAccounts')}: {accounts.length}
                                </Text>
                            </View>
                        </View>

                        <View style={[styles.separator, { backgroundColor: theme.border }]} />

                        <View style={styles.syncButtons}>
                            <Pressable
                                style={[styles.syncButton, { backgroundColor: theme.primary }]}
                                onPress={syncToCloud}
                                disabled={syncStatus === 'syncing'}
                            >
                                {syncStatus === 'syncing' ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <>
                                        <Ionicons name="cloud-upload-outline" size={24} color="#fff" />
                                        <Text style={styles.syncButtonText}>{t('syncToCloud')}</Text>
                                    </>
                                )}
                            </Pressable>

                            <View style={styles.buttonSpacer} />

                            <Pressable
                                style={[styles.syncButton, { backgroundColor: theme.primary }]}
                                onPress={retrieveFromCloud}
                                disabled={syncStatus === 'syncing'}
                            >
                                {syncStatus === 'syncing' ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <>
                                        <Ionicons name="cloud-download-outline" size={24} color="#fff" />
                                        <Text style={styles.syncButtonText}>{t('retrieveFromCloud')}</Text>
                                    </>
                                )}
                            </Pressable>
                        </View>
                    </>
                )}
            </View>

            <View style={styles.infoSection}>
                <Ionicons name="information-circle-outline" size={24} color={theme.textSecondary} />
                <Text style={[styles.infoText, { color: theme.textSecondary }]}>
                    {t('syncInfo')}
                </Text>
            </View>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: 16,
        borderBottomWidth: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: '600',
    },
    section: {
        marginTop: 20,
        borderTopWidth: 1,
        borderBottomWidth: 1,
    },
    signInContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    signInText: {
        fontSize: 16,
        textAlign: 'center',
        marginTop: 16,
        marginBottom: 24,
    },
    button: {
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    userTextContainer: {
        marginLeft: 12,
        flex: 1,
    },
    userName: {
        fontSize: 20,
        fontWeight: '600',
    },
    syncStatus: {
        fontSize: 14,
        marginTop: 4,
    },
    accountCount: {
        fontSize: 14,
        marginTop: 4,
    },
    separator: {
        height: 1,
        marginLeft: 16,
    },
    syncButtons: {
        padding: 16,
    },
    syncButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 8,
    },
    syncButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    buttonSpacer: {
        height: 16,
    },
    infoSection: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    infoText: {
        fontSize: 14,
        marginLeft: 8,
        flex: 1,
    },
});
