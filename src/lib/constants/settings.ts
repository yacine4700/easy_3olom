export interface SettingDefinition {
  key: string;
  group: "general" | "webhook";
  label: string;
  secret: boolean;
  placeholder?: string;
  help?: string;
  defaultValue: string;
}

export const SETTING_GROUPS = [
  { key: "general" as const, label: "عام", description: "هوية التطبيق والمادة" },
  { key: "webhook" as const, label: "Webhook", description: "رابط يُستدعى عند إضافة/تعديل/حذف معرفة أو قاعدة منهجية أو مصطلح" },
];

export const SETTING_DEFINITIONS: SettingDefinition[] = [
  { key: "general.app_name", group: "general", label: "اسم التطبيق", secret: false, placeholder: "إيزي علوم — لوحة التحكم", defaultValue: "إيزي علوم — لوحة التحكم" },
  { key: "general.subject", group: "general", label: "المادة", secret: false, placeholder: "علوم الطبيعة والحياة", help: "الاسم العربي للمادة", defaultValue: "علوم الطبيعة والحياة" },
  { key: "webhook.url", group: "webhook", label: "رابط Webhook", secret: false, placeholder: "https://n8n.example.com/webhook/admin", help: "يُرسل إليه { entity, action, data } عند كل عملية إضافة/تعديل/حذف", defaultValue: "" },
];

export const SETTING_MAP = new Map(SETTING_DEFINITIONS.map((d) => [d.key, d]));
export const SECRET_MASK = "••••••••••••";
export function isMaskedValue(value: string) { return value === SECRET_MASK; }
