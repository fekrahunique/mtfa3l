/**
 * Mirrors the structure of the ministry's activity programme PDFs
 * (برامج الأنشطة الطلابية، نسخة تجريبية ١٤٤٧-٢٠٢٥).
 *
 * Every record is transcribed from a source file in Drive. Fields that could
 * not be read reliably from the source are left `null` rather than guessed —
 * see `unreadable` for which ones and why.
 */

export type Stage = "ابتدائي" | "متوسط";

export type ActivityField =
  | "النشاط الكشفي"
  | "الرياضة والصحة"
  | "العلوم والتقنية"
  | "المواطنة والحياة"
  | "الأيام الوطنية"
  | "الأيام العالمية";

export type PeriodKind = "الاستراحات" | "صلاة الظهر والمناوبة";

export interface ActivityDuration {
  /** Minutes stated in the source, when legible. */
  minutes: number | null;
  /** Equivalent number of activity periods (حصص نشاط), when legible. */
  periods: number | null;
  /** Raw phrase as printed, kept so nothing is lost in normalisation. */
  raw: string;
}

export interface ActivityLocation {
  /** داخل المدرسة */
  inside: string | null;
  /** خارج المدرسة */
  outside: string | null;
}

export interface Activity {
  id: string;
  /** Programme title exactly as printed on the cover. */
  title: string;
  field: ActivityField;
  stage: Stage;
  /** Some primary-stage files target upper grades only (الصفوف العليا). */
  stageNote: string | null;

  /** نواتج التعلم */
  outcomes: string[];
  /** أساليب التقويم */
  assessment: string[];
  /** هدف النشاط */
  objective: string | null;

  duration: ActivityDuration;
  location: ActivityLocation;
  /** وقت تنفيذ النشاط */
  timing: string | null;
  /** مسؤولية التنفيذ */
  responsibility: string | null;
  /** الدعم والمساندة */
  support: string | null;
  /** أدوات التنفيذ */
  tools: string[];
  /** هل يمكن تكراره لمجموعات أخرى */
  repeatable: boolean | null;

  source: {
    driveFileId: string;
    fileName: string;
    viewUrl: string;
  };

  /** Field names that the source did not render legibly. */
  unreadable: string[];
}

export interface WeeklyPeriodActivity {
  id: string;
  title: string;
  kind: PeriodKind;
  stage: Stage;
  /** Week number in the term, where the source is organised by week. */
  week: number | null;
  source: {
    driveFileId: string;
    fileName: string;
    viewUrl: string;
  };
}
