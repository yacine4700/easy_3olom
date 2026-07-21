import { LayoutDashboard, Library, MessageCircleQuestion, Route, Target, BookText, ChartNoAxesColumn, Settings } from "lucide-react";
import type { NavConfig } from "@/types/nav";

export const navConfig: NavConfig = [
  { key: "overview", label: "نظرة عامة", items: [
    { key: "dashboard", title: "الرئيسية", href: "/", icon: LayoutDashboard, description: "حالة المشروع والنشاط الأخير" },
  ]},
  { key: "knowledge", label: "المعرفة", items: [
    { key: "knowledge-base", title: "قاعدة المعرفة", href: "/knowledge-base", icon: Library, description: "إدارة وثائق مصدر RAG" },
    { key: "glossary", title: "المعجم", href: "/glossary", icon: BookText, description: "مصطلحات وتعريفات المجال" },
  ]},
  { key: "pedagogy", label: "البيداغوجيا", items: [
    { key: "methodology", title: "قواعد المنهجية", href: "/methodology", icon: Route, description: "قواعد يتبعها الطالب في الاختبارات" },
    { key: "learning-objectives", title: "أهداف التعلم", href: "/learning-objectives", icon: Target, description: "الكفاءات المستهدمة", badge: "قريباً", disabled: true },
  ]},
  { key: "engagement", label: "التفاعل", items: [
    { key: "student-questions", title: "أسئلة الطلاب", href: "/student-questions", icon: MessageCircleQuestion, description: "الأسئلة الواردة عبر تيليجرام" },
    { key: "analytics", title: "التحليلات", href: "/analytics", icon: ChartNoAxesColumn, description: "إحصائيات الاستخدام" },
  ]},
  { key: "system", label: "النظام", items: [
    { key: "settings", title: "الإعدادات", href: "/settings", icon: Settings, description: "إعدادات مساحة العمل" },
  ]},
];
