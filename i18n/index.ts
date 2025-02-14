import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      authenticator: 'Authenticator',
      settings: 'Settings',
      clearAllAccounts: 'Clear All Accounts',
      clearConfirmTitle: 'Clear All Accounts',
      clearConfirmMessage: 'Are you sure you want to remove all accounts? This action cannot be undone.',
      cancel: 'Cancel',
      clear: 'Clear',
      version: 'Version',
      noAccounts: 'No accounts added yet. Scan a QR code to add an account.',
    },
  },
  es: {
    translation: {
      authenticator: 'Autenticador',
      settings: 'Ajustes',
      clearAllAccounts: 'Borrar todas las cuentas',
      clearConfirmTitle: 'Borrar todas las cuentas',
      clearConfirmMessage: '¿Estás seguro de que quieres eliminar todas las cuentas? Esta acción no se puede deshacer.',
      cancel: 'Cancelar',
      clear: 'Borrar',
      version: 'Versión',
      noAccounts: 'Aún no hay cuentas añadidas. Escanea un código QR para añadir una cuenta.',
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;