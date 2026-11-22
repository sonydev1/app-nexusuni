import { PlanKind } from "@/features/programs/constants";

export type CourseRef = { id: string; code: string; name: string };

export type CourseOption = CourseRef & { isActive: boolean };

export type CourseRow = {
  id: string;
  code: string;
  name: string;
  departmentId: string;
  departmentName: string;
  departmentCode: string;
  departmentActive: boolean;
  credits: number;
  weeklyHours: number;
  description: string;
  isActive: boolean;
  createdLabel: string;
  prerequisites: CourseRef[];
};

export type CoursePlanEntry = {
  programId: string;
  programCode: string;
  programName: string;
  semester: number;
  kind: PlanKind;
};

export type CourseDetail = CourseRow & {
  requiredBy: CourseRef[];
  programs: CoursePlanEntry[];
};
