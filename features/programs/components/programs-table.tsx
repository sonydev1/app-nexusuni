"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import StatusBadge from "@/components/status-badge";
import { PROGRAM_LEVEL_LABELS, PROGRAM_LEVEL_OPTIONS } from "../constants";
import type { DepartmentOption, ProgramRow } from "../types/program-types";
import ProgramRowActions from "./program-row-actions";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

type StatusFilter = "all" | "active" | "inactive";

export default function ProgramsTable({
  data,
  departments,
}: {
  data: ProgramRow[];
  departments: DepartmentOption[];
}) {
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState("all");
  const [status, setStatus] = useState<StatusFilter>("all");

  const rows = useMemo(() => {
    const q = normalize(query.trim());
    return data.filter((p) => {
    
      if (level !== "all" && p.level !== level) return false;
      if (status === "active" && !p.isActive) return false;
      if (status === "inactive" && p.isActive) return false;
      return (
        !q || normalize(`${p.code} ${p.name} ${p.departmentName}`).includes(q)
      );
    });
  }, [data, query, level, status]);

  const searchParams = useSearchParams();
  const [departmentId, setDepartmentId] = useState(() => {
    const fromUrl = searchParams.get("department");
    return fromUrl && departments.some((d) => d.id === fromUrl)
      ? fromUrl
      : "all";
  });

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-slate-200 p-4 dark:border-slate-800 lg:flex-row lg:items-center lg:justify-between lg:px-6">
        <div className="relative lg:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por código, nombre o departamento"
            className="pl-9"
            aria-label="Buscar carreras"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-3 lg:flex">
          <select
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            aria-label="Filtrar por departamento"
            className="input lg:w-48"
          >
            <option value="all">Todos los departamentos</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            aria-label="Filtrar por nivel"
            className="input lg:w-44"
          >
            <option value="all">Todos los niveles</option>
            {PROGRAM_LEVEL_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as StatusFilter)}
            aria-label="Filtrar por estado"
            className="input lg:w-40"
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activas</option>
            <option value="inactive">Inactivas</option>
          </select>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="px-4 sm:px-6">Código</TableHead>
            <TableHead className="px-4 sm:px-6">Carrera</TableHead>
            <TableHead className="hidden px-4 md:table-cell sm:px-6">
              Nivel
            </TableHead>
            <TableHead className="hidden px-4 lg:table-cell sm:px-6">
              Duración
            </TableHead>
            <TableHead className="hidden px-4 sm:table-cell sm:px-6">
              Estado
            </TableHead>
            <TableHead className="w-12 px-4 sm:px-6">
              <span className="sr-only">Acciones</span>
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {rows.length ? (
            rows.map((p) => (
              <TableRow key={p.id} className={p.isActive ? "" : "opacity-60"}>
                <TableCell className="px-4 sm:px-6">
                  <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs dark:bg-slate-800">
                    {p.code}
                  </code>
                </TableCell>
                <TableCell className="px-4 sm:px-6">
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 font-medium">
                      <Link href={`/admin/programs/${p.id}`} className="truncate hover:underline">{p.name}</Link>
                      {!p.isActive && (
                        <StatusBadge className="sm:hidden">
                          Inactiva
                        </StatusBadge>
                      )}
                    </p>
                    <p className="muted truncate text-xs">{p.departmentName}</p>
                  </div>
                </TableCell>
                <TableCell className="hidden px-4 md:table-cell sm:px-6">
                  <StatusBadge tone="sky">
                    {PROGRAM_LEVEL_LABELS[p.level]}
                  </StatusBadge>
                </TableCell>
                <TableCell className="hidden whitespace-nowrap px-4 lg:table-cell sm:px-6">
                  {p.durationSemesters} sem · {p.totalCredits} créd.
                </TableCell>
                <TableCell className="hidden px-4 sm:table-cell sm:px-6">
                  <StatusBadge tone={p.isActive ? "emerald" : "slate"}>
                    {p.isActive ? "Activa" : "Inactiva"}
                  </StatusBadge>
                </TableCell>
                <TableCell className="px-4 sm:px-6">
                  <div className="flex justify-end">
                    <ProgramRowActions program={p} departments={departments} />
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="h-32 text-center">
                <span className="muted">
                  {data.length === 0
                    ? "Todavía no hay carreras. Crea la primera con «Nueva carrera»."
                    : "Ninguna carrera coincide con los filtros."}
                </span>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="border-t border-slate-200 px-4 py-3 dark:border-slate-800 sm:px-6">
        <p className="muted text-sm">
          {rows.length} de {data.length} carreras
        </p>
      </div>
    </div>
  );
}
