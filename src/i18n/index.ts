import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import commonEn from './locales/en/common.json'
import bentoEn from './locales/en/bento.json'
import projectsEn from './locales/en/projects.json'
import terminalEn from './locales/en/terminal.json'

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        common: commonEn,
        bento: bentoEn,
        projects: projectsEn,
        terminal: terminalEn,
      },
    },
    lng: 'en',
    fallbackLng: 'en',
    defaultNS: 'common',
    keySeparator: false,
    showSupportNotice: false,
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n
