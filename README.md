# Maringo Timesheet Helper

אפליקציית עזר אישית למעקב שעות לפי פרויקטים, כדי להגיע להזנה החודשית במרינגו / MARIProject עם רפרנס מסודר וברור.

## מה יש בגרסת הבסיס

- אפליקציית React + Vite + TypeScript
- UI מובייל־פרסט עם כרטיסים רכים, bottom navigation ו־bottom sheet להזנת שעות
- שמירת נתונים מקומית ב־IndexedDB באמצעות Dexie
- ניהול פרויקטים בסיסי
- הזנת שעות לפי יום ופרויקט
- חיווי מול מכסת 9 שעות יומית
- תצוגת חודש עם סטטוסים
- מצב דוח להזנה במרינגו
- סימון יום כ״הוזן במרינגו״
- ייצוא CSV וגיבוי JSON
- GitHub Actions לפריסה ל־GitHub Pages

## הרצה מקומית / Codespaces

```bash
npm install
npm run dev
```

לאחר מכן פותחים את כתובת ה־localhost שמופיעה בטרמינל.

## Build

```bash
npm run build
npm run preview
```

## פריסה ל־GitHub Pages

1. העלו את כל הקבצים לשורש הריפו.
2. ודאו שהענף הראשי נקרא `main`.
3. היכנסו ל־Settings → Pages.
4. תחת Build and deployment בחרו `GitHub Actions`.
5. בצעו push ל־main.
6. ה־workflow שבתיקיית `.github/workflows/deploy.yml` יבנה ויפרסם את האפליקציה.

## הערת פרטיות

הנתונים נשמרים מקומית בדפדפן של המשתמש באמצעות IndexedDB. אין שרת ואין שליחת נתונים החוצה בגרסת הבסיס.
