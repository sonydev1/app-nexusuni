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
import type { DepartmentRow } from "../types/department-types";
import DepartmentRowActions from "./department-row-actions";
import Link from "next/link";

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

type StatusFilter = "all" | "active" | "inactive";

export default function DepartmentsTable({ data }: { data: DepartmentRow[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");

  const rows = useMemo(() => {
    const q = normalize(query.trim());
    return data.filter((d) => {
      if (status === "active" && !d.isActive) return false;
      if (status === "inactive" && d.isActive) return false;
      return !q || normalize(`${d.code} ${d.name}`).includes(q);
    });
  }, [data, query, status]);

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-slate-200 p-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="relative sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por código o nombre"
            className="pl-9"
            aria-label="Buscar departamentos"
          />
        </div>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as StatusFilter)}
          aria-label="Filtrar por estado"
          className="input sm:w-48"
        >
          <option value="all">Todos los estados</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
        </select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="px-4 sm:px-6">Código</TableHead>
            <TableHead className="px-4 sm:px-6">Nombre</TableHead>
            <TableHead className="hidden px-4 md:table-cell sm:px-6">
              Carreras
            </TableHead>
            <TableHead className="hidden px-4 sm:table-cell sm:px-6">
              Estado
            </TableHead>
            <TableHead className="hidden px-4 md:table-cell sm:px-6">
              Creado
            </TableHead>
            <TableHead className="w-12 px-4 sm:px-6">
              <span className="sr-only">Acciones</span>
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {rows.length ? (
            rows.map((d) => (
              <TableRow key={d.id} className={d.isActive ? "" : "opacity-60"}>
                <TableCell className="px-4 sm:px-6">
                  <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs dark:bg-slate-800">
                    {d.code}
                  </code>
                </TableCell>
                <TableCell className="px-4 sm:px-6">
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 font-medium">
                      <span className="truncate">{d.name}</span>
                      {!d.isActive && (
                        <StatusBadge className="sm:hidden">
                          Inactivo
                        </StatusBadge>
                      )}
                    </p>
                    {d.description && (
                      <p className="muted line-clamp-1 hidden text-xs sm:block">
                        {d.description}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell className="hidden px-4 md:table-cell sm:px-6">
                  {d.programCount > 0 ? (
                    <Link
                      href={`/admin/programs?department=${d.id}`}
                      className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                    >
                      {d.programCount}
                    </Link>
                  ) : (
                    <span className="muted">0</span>
                  )}
                </TableCell>
                <TableCell className="hidden px-4 sm:table-cell sm:px-6">
                  <StatusBadge tone={d.isActive ? "emerald" : "slate"}>
                    {d.isActive ? "Activo" : "Inactivo"}
                  </StatusBadge>
                </TableCell>
                <TableCell className="hidden whitespace-nowrap px-4 md:table-cell sm:px-6">
                  {d.createdLabel}
                </TableCell>
                <TableCell className="px-4 sm:px-6">
                  <div className="flex justify-end">
                    <DepartmentRowActions department={d} />
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="h-32 text-center">
                <span className="muted">
                  {data.length === 0
                    ? "Todavía no hay departamentos. Crea el primero con «Nuevo departamento»."
                    : "Ningún departamento coincide con la búsqueda."}
                </span>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="border-t border-slate-200 px-4 py-3 dark:border-slate-800 sm:px-6">
        <p className="muted text-sm">
          {rows.length} de {data.length} departamentos
        </p>
      </div>
    </div>
  );
}
