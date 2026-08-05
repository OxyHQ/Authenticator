import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      authenticator: 'Authenticator',
      accounts: 'Accounts',
      settings: 'Settings',
      clearAllAccounts: 'Clear All Accounts',
      clearConfirmTitle: 'Clear All Accounts',
      clearConfirmMessage: 'Are you sure you want to remove all accounts? This action cannot be undone.',
      cancel: 'Cancel',
      clear: 'Clear',
      version: 'Version',
      noAccounts: 'No accounts added yet. Scan a QR code to add an account.',
      sync: 'Sync',
      syncAccounts: 'Sync Accounts',
      addAccount: 'Add Account',
      signIn: 'Sign In',
      darkMode: 'Dark Mode',
      language: 'Language',
      codeCopied: 'Code copied',
      copyCodeFor: 'Copy the code for {{issuer}} {{account}}',
      notFoundTitle: "This screen doesn't exist.",
      notFoundAction: 'Go to home screen',
      scanQr: 'Scan QR',
      scanTitle: 'Scan QR Code',
      scanInstructions: 'Position the QR code within the frame to add it to your authenticator',
      scanAgain: 'Scan Again',
      cameraRequesting: 'Requesting camera permission...',
      cameraRequiredTitle: 'Camera Access Required',
      cameraRequiredMessage:
        'Camera access is required to scan QR codes. Please enable camera access in your device settings.',
      cameraGrant: 'Grant Permission',
      signInToSync: 'Sign in to your Oxy account to sync your authenticator accounts across your devices.',
      syncToCloud: 'Sync to Cloud',
      retrieveFromCloud: 'Retrieve from Cloud',
      lastSynced: 'Last synced',
      neverSynced: 'Never synced',
      localAccounts: 'Local accounts',
      syncSuccessTitle: 'Sync Successful',
      syncSuccessMessage: 'Your accounts have been successfully synced to the cloud.',
      syncErrorTitle: 'Sync Failed',
      syncErrorMessage: 'There was an error syncing your accounts to the cloud. Please try again.',
      retrieveSuccessTitle: 'Retrieval Successful',
      retrieveSuccessMessage: 'Your accounts have been successfully retrieved from the cloud.',
      retrieveErrorTitle: 'Retrieval Failed',
      retrieveErrorMessage: 'There was an error retrieving your accounts from the cloud. Please try again.',
      retrieveConfirmTitle: 'Replace Local Accounts?',
      retrieveConfirmMessage:
        'This will replace your local accounts with those stored in the cloud. Do you want to continue?',
      confirm: 'Confirm',
      noCloudDataTitle: 'No Cloud Data',
      noCloudDataMessage: 'No accounts found in the cloud. Sync your accounts first.',
      syncInfo:
        'Sync stores your authenticator accounts against your Oxy account so they are available on your other devices.',
    },
  },
  es: {
    translation: {
      authenticator: 'Autenticador',
      accounts: 'Cuentas',
      settings: 'Ajustes',
      clearAllAccounts: 'Borrar todas las cuentas',
      clearConfirmTitle: 'Borrar todas las cuentas',
      clearConfirmMessage:
        '¿Estás seguro de que quieres eliminar todas las cuentas? Esta acción no se puede deshacer.',
      cancel: 'Cancelar',
      clear: 'Borrar',
      version: 'Versión',
      noAccounts: 'Aún no hay cuentas añadidas. Escanea un código QR para añadir una cuenta.',
      sync: 'Sincronizar',
      syncAccounts: 'Sincronizar Cuentas',
      addAccount: 'Agregar cuenta',
      signIn: 'Iniciar Sesión',
      darkMode: 'Modo oscuro',
      language: 'Idioma',
      codeCopied: 'Código copiado',
      copyCodeFor: 'Copiar el código de {{issuer}} {{account}}',
      notFoundTitle: 'Esta pantalla no existe.',
      notFoundAction: 'Ir a la pantalla principal',
      scanQr: 'Escanear QR',
      scanTitle: 'Escanear código QR',
      scanInstructions: 'Coloca el código QR dentro del marco para añadirlo a tu autenticador',
      scanAgain: 'Escanear de nuevo',
      cameraRequesting: 'Solicitando permiso de cámara...',
      cameraRequiredTitle: 'Acceso a la cámara requerido',
      cameraRequiredMessage:
        'Se necesita acceso a la cámara para escanear códigos QR. Actívalo en los ajustes de tu dispositivo.',
      cameraGrant: 'Conceder permiso',
      signInToSync:
        'Inicia sesión en tu cuenta de Oxy para sincronizar tus cuentas de autenticación en todos tus dispositivos.',
      syncToCloud: 'Sincronizar con la nube',
      retrieveFromCloud: 'Recuperar de la nube',
      lastSynced: 'Última sincronización',
      neverSynced: 'Nunca sincronizado',
      localAccounts: 'Cuentas locales',
      syncSuccessTitle: 'Sincronización exitosa',
      syncSuccessMessage: 'Tus cuentas se han sincronizado correctamente con la nube.',
      syncErrorTitle: 'Error de sincronización',
      syncErrorMessage:
        'Hubo un error al sincronizar tus cuentas con la nube. Por favor, inténtalo de nuevo.',
      retrieveSuccessTitle: 'Recuperación exitosa',
      retrieveSuccessMessage: 'Tus cuentas se han recuperado correctamente de la nube.',
      retrieveErrorTitle: 'Error de recuperación',
      retrieveErrorMessage:
        'Hubo un error al recuperar tus cuentas de la nube. Por favor, inténtalo de nuevo.',
      retrieveConfirmTitle: '¿Reemplazar cuentas locales?',
      retrieveConfirmMessage:
        'Esto reemplazará tus cuentas locales con las almacenadas en la nube. ¿Quieres continuar?',
      confirm: 'Confirmar',
      noCloudDataTitle: 'No hay datos en la nube',
      noCloudDataMessage: 'No se encontraron cuentas en la nube. Sincroniza tus cuentas primero.',
      syncInfo:
        'La sincronización guarda tus cuentas de autenticación en tu cuenta de Oxy para que estén disponibles en tus otros dispositivos.',
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
  // Resources are bundled and `init` is synchronous, so nothing here ever
  // suspends. Turning suspense off keeps it that way: a `t()` call from a
  // boot-mounted component must never suspend the root render.
  react: {
    useSuspense: false,
  },
});

export default i18n;
