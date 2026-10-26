"use client";

import { useMemo, useState } from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Avatar from "@/components/avatar";
import RoleBadge from "@/components/role-badge";
import { ROLE_LABELS } from "@/lib/roles";
import RowActions from "./row-actions";

import type { UserRow } from "../types/user-types"

function SortHeader({
  label,
  column,
}: {
  label: string;
  column: {
    getIsSorted: () => false | "asc" | "desc";
    toggleSorting: (desc?: boolean) => void;
  };
}) {
  const sorted = column.getIsSorted();
  const Icon =
    sorted === "asc" ? ArrowUp : sorted === "desc" ? ArrowDown : ArrowUpDown;

  return (
    <button
      type="button"
      onClick={() => column.toggleSorting(sorted === "asc")}
      className="inline-flex items-center gap-1.5 font-medium hover:text-foreground"
    >
      {label}
      <Icon className="h-3.5 w-3.5 opacity-60" />
    </button>
  );
}

export default function UsersTable({
  data,
  currentUserId,
}: {
  data: UserRow[];
  currentUserId: string;
}) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const columns = useMemo<ColumnDef<UserRow>[]>(
    () => [
      {
        id: "user",
        // Esta cadena es lo que se busca: nombre + correo
        accessorFn: (row) => `${row.name} ${row.email}`,
        header: ({ column }) => <SortHeader label="Usuario" column={column} />,
        cell: ({ row }) => (
          <div className="flex min-w-0 items-center gap-3">
            <Avatar name={row.original.name} path={row.original.avatarPath} />
            <div className="min-w-0">
              <p className="flex items-center gap-2 font-medium">
                <span className="truncate">{row.original.name}</span>
                {row.original.disabled && (
                  <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-normal text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    Desactivado
                  </span>
                )}
                 {row.original.studentStatus === 'inactive' &&(
                    <span className="shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-normal text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                    Estudiante inactivo
                  </span>
                )}{row.original.studentStatus === 'graduated' &&(
                  <span className="shrink-0 rounded-full bg-sky-50 px-2 py-0.5 text-xs font-normal text-sky-700 dark:bg-sky-500/10 dark:text-sky-300">
                  Graduado
                </span>
                )}
              </p>
              <p className="muted truncate text-xs">{row.original.email}</p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "document",
        header: "Documento",
        cell: ({ getValue }) => (
          <span className="whitespace-nowrap">{getValue<string>() || "—"}</span>
        ),
      },
      {
        accessorKey: "roles",
        header: "Roles",
        // 'arrIncludes': la fila pasa si su arreglo contiene el valor del filtro
        filterFn: "arrIncludes",
        enableSorting: false,
        cell: ({ getValue }) => (
          <div className="flex flex-wrap gap-1">
            {getValue<string[]>().map((r) => (
              <RoleBadge key={r} role={r} />
            ))}
          </div>
        ),
      },
      {
        accessorKey: "createdAt",
        enableGlobalFilter: false,
        header: ({ column }) => <SortHeader label="Creado" column={column} />,
        cell: ({ row }) => (
          <span className="whitespace-nowrap">{row.original.createdLabel}</span>
        ),
      },
      {
        id: "actions",
        enableSorting: false,
        enableGlobalFilter: false,
        header: ({column}) =><SortHeader label="Acciones" column={column} />,
        cell: ({ row }) => (
          <div className="flex justify-end">
            <RowActions
              userId={row.original.id}
              name={row.original.name}
              disabled={row.original.disabled}
              isSelf={row.original.id === currentUserId}
            />
          </div>
        ),
      },
    ],
    [currentUserId],
  );

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnFilters, globalFilter },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  const roleFilter =
    (table.getColumn("roles")?.getFilterValue() as string | undefined) ?? "all";
  const filteredCount = table.getFilteredRowModel().rows.length;
  const { pageIndex, pageSize } = table.getState().pagination;
  const from = filteredCount === 0 ? 0 : pageIndex * pageSize + 1;
  const to = Math.min((pageIndex + 1) * pageSize, filteredCount);

  return (
    <div className="card overflow-hidden">
    
      <div className="flex flex-col gap-3 border-b border-slate-200 p-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="relative sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input

            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Buscar por nombre, correo o documento"
            className="pl-9 "
            aria-label="Buscar usuarios"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) =>
            table
              .getColumn("roles")
              ?.setFilterValue(
                e.target.value === "all" ? undefined : e.target.value,
              )
          }
          aria-label="Filtrar por rol"
          className="input sm:w-48"
        >
          <option value="all">Todos los roles</option>
          {Object.entries(ROLE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Tabla (el componente Table ya hace scroll horizontal en móvil) */}
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((group) => (
            <TableRow key={group.id}>
              {group.headers.map((header) => (
                <TableHead key={header.id} className="px-4 sm:px-6">
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className={row.original.disabled ? "opacity-50" : ""}
              >
               
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="px-4 sm:px-6">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-32 text-center">
                <span className="muted">No se encontraron usuarios.</span>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Paginación */}
      <div className="flex items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 dark:border-slate-800 sm:px-6">
        <p className="muted text-sm">
          {from}–{to} de {filteredCount}
        </p>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Anterior</span>
          </Button>
          <span className="muted text-sm">
            {pageIndex + 1} / {Math.max(table.getPageCount(), 1)}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="hidden sm:inline">Siguiente</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
