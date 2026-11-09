"use client";

import { useState, useTransition } from "react";
import {
  Loader2,
  MoreHorizontal,
  Pencil,
  Power,
  PowerOff,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  deleteDepartment,
  setDepartmentActive,
} from "../services/department-actions";
import type { DepartmentRow } from "../types/department-types";
import DepartmentDialog from "./department-dialog";

export default function DepartmentRowActions({
  department,
}: {
  department: DepartmentRow;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function toggleActive() {
    startTransition(async () => {
      const res = await setDepartmentActive(
        department.id,
        !department.isActive,
      );
      if (res.error) toast.error(res.error);
      else toast.success(res.success);
    });
  }

  function confirmDelete() {
    startTransition(async () => {
      const res = await deleteDepartment(department.id);
      if (res.error) toast.error(res.error);
      else toast.success(res.success);
      setConfirmOpen(false);
    });
  }

  const hasPrograms = department.programCount > 0

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Acciones para ${department.name}`}
            disabled={pending}
          >
            {pending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MoreHorizontal className="h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuLabel className="truncate">
            {department.name}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem onSelect={() => setEditOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={toggleActive}>
            {department.isActive ? (
              <>
                <PowerOff className="mr-2 h-4 w-4" />
                Desactivar
              </>
            ) : (
              <>
                <Power className="mr-2 h-4 w-4" />
                Reactivar
              </>
            )}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onSelect={() => setConfirmOpen(true)}
            className="text-red-600 focus:text-red-600 dark:text-red-400"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DepartmentDialog
        department={department}
        open={editOpen}
        onOpenChange={setEditOpen}
      />

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {hasPrograms
                ? "No se puede eliminar"
                : `¿Eliminar ${department.name}?`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {hasPrograms
                ? `${department.name} tiene ${department.programCount} ${
                    department.programCount === 1
                      ? "carrera asociada"
                      : "carreras asociadas"
                  }. Para eliminarlo, primero elimina esas carreras o muévelas a otro departamento. Mientras tanto puedes desactivarlo.`
                : "Esta acción no se puede deshacer."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>
              {hasPrograms ? "Cerrar" : "Cancelar"}
            </AlertDialogCancel>
            {!hasPrograms && (
              <AlertDialogAction
                disabled={pending}
                onClick={(e) => {
                  e.preventDefault();
                  confirmDelete();
                }}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Eliminar
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
