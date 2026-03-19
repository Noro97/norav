import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import commonEn from './locales/en/common.json'
import heroEn from './locales/en/hero.json'
import aboutEn from './locales/en/about.json'
import experienceEn from './locales/en/experience.json'
import skillsEn from './locales/en/skills.json'
import bentoEn from './locales/en/bento.json'
import projectsEn from './locales/en/projects.json'
import educationEn from './locales/en/education.json'
import terminalEn from './locales/en/terminal.json'
import vibecodingEn from './locales/en/vibecoding.json'
import chatEn from './locales/en/chat.json'
import workflowEn from './locales/en/workflow.json'

import commonRu from './locales/ru/common.json'
import heroRu from './locales/ru/hero.json'
import aboutRu from './locales/ru/about.json'
import experienceRu from './locales/ru/experience.json'
import skillsRu from './locales/ru/skills.json'
import bentoRu from './locales/ru/bento.json'
import projectsRu from './locales/ru/projects.json'
import educationRu from './locales/ru/education.json'
import terminalRu from './locales/ru/terminal.json'
import vibecodingRu from './locales/ru/vibecoding.json'
import chatRu from './locales/ru/chat.json'
import workflowRu from './locales/ru/workflow.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        common: commonEn,
        hero: heroEn,
        about: aboutEn,
        experience: experienceEn,
        skills: skillsEn,
        bento: bentoEn,
        projects: projectsEn,
        education: educationEn,
        terminal: terminalEn,
        vibecoding: vibecodingEn,
        chat: chatEn,
        workflow: workflowEn,
      },
      ru: {
        common: commonRu,
        hero: heroRu,
        about: aboutRu,
        experience: experienceRu,
        skills: skillsRu,
        bento: bentoRu,
        projects: projectsRu,
        education: educationRu,
        terminal: terminalRu,
        vibecoding: vibecodingRu,
        chat: chatRu,
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
