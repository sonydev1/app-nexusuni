export const PROGRAM_LEVELS = [
  "technical",
  "undergraduate",
  "specialization",
  "master",
  "doctorate",
] as const;

export type ProgramLevel = (typeof PROGRAM_LEVELS)[number];

export const PROGRAM_LEVEL_LABELS: Record<ProgramLevel, string> = {
  technical: "Técnico / Tecnólogo",
  undergraduate: "Pregrado",
  specialization: "Especialización",
  master: "Maestría",
  doctorate: "Doctorado",
};

export const PROGRAM_LEVEL_OPTIONS = PROGRAM_LEVELS.map((value) => ({
  value,
  label: PROGRAM_LEVEL_LABELS[value],
}));

export const PROGRAM_MODALITIES = ["in_person", "virtual"] as const;

export type ProgramModality = (typeof PROGRAM_MODALITIES)[number];

export const PROGRAM_MODALITY_LABELS: Record<ProgramModality, string> = {
  in_person: "Presencial",
  virtual: "Virtual",
};

export const PROGRAM_MODALITY_OPTIONS = PROGRAM_MODALITIES.map((value) => ({
  value,
  label: PROGRAM_MODALITY_LABELS[value],
}));
