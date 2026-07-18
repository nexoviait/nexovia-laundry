import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';
import en from './locales/en';

// FR-CUS-015: i18n-ready setup — English only in Phase 1 (per the SRS,
// additional languages are Phase 3). Adding a locale later is just a new
// file in ./locales plus a `translations` entry; no screen code changes.
const translations = { en };

const i18n = new I18n(translations);
i18n.locale = Localization.getLocales()[0]?.languageCode || 'en';
i18n.enableFallback = true;
i18n.defaultLocale = 'en';

export function t(key, params) {
    return i18n.t(key, params);
}

export default i18n;
