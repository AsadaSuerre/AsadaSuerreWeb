// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock environment variables
Object.defineProperty(global, 'import', {
  value: {
    meta: {
      env: {
        VITE_API_URL: 'http://localhost:8787',
        VITE_IMAGE_BASE_URL: 'http://localhost:8787/images',
      },
    },
  },
  writable: true,
});

// Mock context providers (using factory functions to avoid out-of-scope variable issues)
jest.mock('./context/AuthContext', () => {
  const React = require('react');
  return {
    AuthContext: React.createContext({
      user: null,
      isAuthenticated: false,
      login: jest.fn(),
      logout: jest.fn(),
    }),
    useAuth: () => ({
      user: null,
      isAuthenticated: false,
      login: jest.fn(),
      logout: jest.fn(),
    }),
    AuthProvider: ({ children }: { children: any }) => children,
  };
});

jest.mock('./context/DialogContext', () => {
  const React = require('react');
  return {
    DialogContext: React.createContext({
      dialog: null,
      openDialog: jest.fn(),
      closeDialog: jest.fn(),
    }),
    useDialog: () => ({
      dialog: null,
      openDialog: jest.fn(),
      closeDialog: jest.fn(),
    }),
    DialogProvider: ({ children }: { children: any }) => children,
  };
});

jest.mock('./context/TranslationContext', () => {
  const React = require('react');
  return {
    TranslationContext: React.createContext({
      t: {
        common: { required: 'requerido', cancel: 'Cancelar', add: 'Agregar', save: 'Guardar', delete: 'Eliminar', edit: 'Editar', loading: 'Cargando...' },
        nav: { home: 'Inicio', news: 'Noticias', services: 'Servicios', governance: 'Gobernanza', about: 'Nosotros', contacts: 'Contactos' },
        auth: { username: 'Usuario', password: 'Contraseña', login: 'Iniciar sesión', loginFailed: 'Error al iniciar sesión' },
        validation: { errorsInFields: 'Hay errores en los campos' },
        upload: { authRequired: 'Autenticación requerida', clickToUpload: 'Clic para subir', allowedTypes: 'Tipos permitidos', fileUploaded: 'Archivo subido', downloadFile: 'Descargar', enterUrl: 'Ingrese URL', fileOptional: 'Archivo (opcional)' },
        errors: { invalidFileType: 'Tipo de archivo inválido', fileTooLarge: 'Archivo demasiado grande', uploadError: 'Error al subir', mustHaveOneSlide: 'Debe haber al menos un slide', deleteError: 'Error al eliminar' },
        icons: { accountBalance: 'Balance', description: 'Descripción', assignment: 'Asignación', payment: 'Pago' },
        empty: { noGovernance: 'No hay datos de gobernanza', noContacts: 'No hay contactos', noNews: 'No hay noticias', noServices: 'No hay servicios' },
      },
      language: 'es',
      setLanguage: jest.fn(),
    }),
    useTranslation: () => ({
      t: {
        common: { required: 'requerido', cancel: 'Cancelar', add: 'Agregar', save: 'Guardar', delete: 'Eliminar', edit: 'Editar', loading: 'Cargando...' },
        nav: { home: 'Inicio', news: 'Noticias', services: 'Servicios', governance: 'Gobernanza', about: 'Nosotros', contacts: 'Contactos' },
        auth: { username: 'Usuario', password: 'Contraseña', login: 'Iniciar sesión', loginFailed: 'Error al iniciar sesión' },
        validation: { errorsInFields: 'Hay errores en los campos' },
        upload: { authRequired: 'Autenticación requerida', clickToUpload: 'Clic para subir', allowedTypes: 'Tipos permitidos', fileUploaded: 'Archivo subido', downloadFile: 'Descargar', enterUrl: 'Ingrese URL', fileOptional: 'Archivo (opcional)' },
        errors: { invalidFileType: 'Tipo de archivo inválido', fileTooLarge: 'Archivo demasiado grande', uploadError: 'Error al subir', mustHaveOneSlide: 'Debe haber al menos un slide', deleteError: 'Error al eliminar' },
        icons: { accountBalance: 'Balance', description: 'Descripción', assignment: 'Asignación', payment: 'Pago' },
        empty: { noGovernance: 'No hay datos de gobernanza', noContacts: 'No hay contactos', noNews: 'No hay noticias', noServices: 'No hay servicios' },
      },
      language: 'es',
      setLanguage: jest.fn(),
    }),
    TranslationProvider: ({ children }: { children: any }) => children,
  };
});

// Mock dataService
jest.mock('./services/dataService', () => ({
  getImageUrl: (url: string) => url,
  deleteFileFromR2: jest.fn(),
}));
