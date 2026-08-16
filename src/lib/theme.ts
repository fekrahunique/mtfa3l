import type { PlanId } from "../data/plans";

export type Gender = "boys" | "girls";
export type Stage = "primary" | "middle";
export type SchoolType = "government" | "private";

export interface Student {
  id: string;
  name: string;
}

export interface RegistrationData {
  teacherName: string;
  email: string;
  phone?: string;
  schoolName: string;
  schoolType: SchoolType | null;
  stage: Stage | null;
  gender: Gender | null;
  students: Student[];
  username: string;
  plan?: PlanId;
}

export const emptyRegistration: RegistrationData = {
  teacherName: "",
  email: "",
  phone: "",
  schoolName: "",
  schoolType: null,
  stage: null,
  gender: null,
  students: [],
  username: "",
  plan: "pro",
};

export const genderAccent: Record<Gender, { text: string; bg: string; bgSoft: string; border: string }> = {
  boys: {
    text: "text-boys-400",
    bg: "bg-boys-500",
    bgSoft: "bg-boys-500/15",
    border: "border-boys-400/40",
  },
  girls: {
    text: "text-girls-400",
    bg: "bg-girls-500",
    bgSoft: "bg-girls-500/15",
    border: "border-girls-400/40",
  },
};
