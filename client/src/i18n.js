import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          "welcome": "Welcome to Massair",
          "explore": "Explore Locations",
          "budget": "Your Budget",
          "change_lang": "عربي",
          "profile": "Profile",
          "leaderboard": "Leaderboard",
          "community": "Community",
          "admin": "Admin Dashboard",
          "xp": "XP",
          "level": "Level",
          "check_in": "Check In Here!",
          "claim_badge": "Claim your Badge!",
          "rare_badge": "Rare Badge Unlocked!",
          "budget_placeholder": "Enter your budget in JOD"
        }
      },
      ar: {
        translation: {
          "welcome": "أهلاً بك في مسير",
          "explore": "استكشف المواقع",
          "budget": "ميزانيتك",
          "change_lang": "English",
          "profile": "الملف الشخصي",
          "leaderboard": "لوحة المتصدرين",
          "community": "المجتمع",
          "admin": "لوحة التحكم",
          "xp": "نقاط خبرة",
          "level": "المستوى",
          "check_in": "سجل حضورك هنا!",
          "claim_badge": "احصل على وسامك!",
          "rare_badge": "لقد حصلت على وسام نادر!",
          "budget_placeholder": "أدخل ميزانيتك بالدينار الأردني"
        }
      }
    },
    fallbackLng: "ar",
    interpolation: { escapeValue: false }
  });

export default i18n;
