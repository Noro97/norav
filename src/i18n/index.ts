import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import commonEn from './locales/en/common.json'
import bentoEn from './locales/en/bento.json'
import projectsEn from './locales/en/projects.json'
import terminalEn from './locales/en/terminal.json'
import vibecodingEn from './locales/en/vibecoding.json'
import workflowEn from './locales/en/workflow.json'

import commonRu from './locales/ru/common.json'
import bentoRu from './locales/ru/bento.json'
import projectsRu from './locales/ru/projects.json'
import terminalRu from './locales/ru/terminal.json'
import vibecodingRu from './locales/ru/vibecoding.json'
import workflowRu from './locales/ru/workflow.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        common: commonEn,
        bento: bentoEn,
        projects: projectsEn,
        terminal: terminalEn,
        vibecoding: vibecodingEn,
        workflow: workflowEn,
      },
      ru: {
        common: commonRu,
        bento: bentoRu,
        projects: projectsRu,
        terminal: terminalRu,
        vibecoding: vibecodingRu,
        workflow: workflowRu,
      },
    },
    lng: 'en',
    fallbackLng: 'en',
    defaultNS: 'common',
    keySeparator: false,
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n
