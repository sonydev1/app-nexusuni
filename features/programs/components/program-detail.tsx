import { notFound } from "next/navigation";
import { connection } from "next/server";
import InfoCard from "@/components/info-card";
import StatusBadge from "@/components/status-badge";
import { PROGRAM_LEVEL_LABELS, PROGRAM_MODALITY_LABELS } from "../constants";
import { getDepartmentOptions, getProgramDetail } from "../services/queries";
import ProgramRowActions from "./program-row-actions";
import { Suspense } from "react";
import ProgramPlanSkeleton from "./program-plan-skeleton";
import ProgramPlan from "./program-plan";

export default async function ProgramDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();
  const { id } = await params;

  const [program, departments] = await Promise.all([
    getProgramDetail(id),
    getDepartmentOptions(),
  ]);
  if (!program) notFound();

  return (
    <div className="space-y-6">
      <header className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs dark:bg-slate-800">
              {program.code}
            </code>
            <StatusBadge tone="sky">
              {PROGRAM_LEVEL_LABELS[program.level]}
            </StatusBadge>
            <StatusBadge
              tone={program.modality === "virtual" ? "violet" : "slate"}
            >
              {PROGRAM_MODALITY_LABELS[program.modality]}
            </StatusBadge>
            <StatusBadge tone={program.isActive ? "emerald" : "slate"}>
              {program.isActive ? "Activa" : "Inactiva"}
            </StatusBadge>
            {!program.departmentActive && (
              <StatusBadge tone="amber">Departamento inactivo</StatusBadge>
            )}
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{program.name}</h1>
          <p className="muted text-sm">{program.departmentName}</p>
        </div>

        <ProgramRowActions
          program={program}
          departments={departments}
          showDetail={false}
          redirectOnDelete
          triggerLabel="Acciones"
        />
      </header>

      <InfoCard
        title="Información general"
        items={[
          [
            "Departamento",
            `${program.departmentCode} · ${program.departmentName}`,
          ],
          ["Nivel", PROGRAM_LEVEL_LABELS[program.level]],
          ["Metodología", PROGRAM_MODALITY_LABELS[program.modality]],
          ["Código SNIES", program.sniesCode || "Sin asignar"],
          ["Duración", `${program.durationSemesters} semestres`],
          ["Meta de créditos", `${program.totalCredits} créditos`],
          ["Creada", program.createdLabel],
          ["Descripción", program.description],
        ]}
      />

      <Suspense fallback={<ProgramPlanSkeleton />}>
        <ProgramPlan program={program} />
      </Suspense>
    </div>
  );
}
