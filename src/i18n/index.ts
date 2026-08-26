import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import commonEn from './locales/en/common.json'
import aboutEn from './locales/en/about.json'
import skillsEn from './locales/en/skills.json'
import bentoEn from './locales/en/bento.json'
import projectsEn from './locales/en/projects.json'
import terminalEn from './locales/en/terminal.json'
import vibecodingEn from './locales/en/vibecoding.json'
import chatEn from './locales/en/chat.json'
import workflowEn from './locales/en/workflow.json'
import extraEn from './locales/en/extra.json'

import commonRu from './locales/ru/common.json'
import aboutRu from './locales/ru/about.json'
import skillsRu from './locales/ru/skills.json'
import bentoRu from './locales/ru/bento.json'
import projectsRu from './locales/ru/projects.json'
import terminalRu from './locales/ru/terminal.json'
import vibecodingRu from './locales/ru/vibecoding.json'
import chatRu from './locales/ru/chat.json'
import workflowRu from './locales/ru/workflow.json'
import extraRu from './locales/ru/extra.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        common: commonEn,
        about: aboutEn,
        skills: skillsEn,
        bento: bentoEn,
        projects: projectsEn,
        terminal: terminalEn,
        vibecoding: vibecodingEn,
        chat: chatEn,
        workflow: workflowEn,
        extra: extraEn,
      },
      ru: {
        common: commonRu,
        about: aboutRu,
        skills: skillsRu,
        bento: bentoRu,
        projects: projectsRu,
        terminal: terminalRu,
        vibecoding: vibecodingRu,
        chat: chatRu,
        workflow: workflowRu,
        extra: extraRu,
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
