"use client";

import { useState, useTransition } from "react";
import {
  Loader2,
  MoreHorizontal,
  Pencil,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserX,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteUserAccount, setUserDisabled } from "../services/manage-user";
import EditUserDialog from "./edit-user-dialog";
import ManageRolesDialog from "./manage-roles-dialog";

export default function RowActions({
  userId,
  name,
  disabled,
  isSelf,
}: {
  userId: string;
  name: string;
  disabled: boolean;
  isSelf: boolean;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [rolesOpen, setRolesOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function toggleDisabled() {
    startTransition(async () => {
      const res = await setUserDisabled(userId, !disabled);
      if (res.error) toast.error(res.error);
      else toast.success(res.success);
    });
  }

  function confirmDelete() {
    startTransition(async () => {
      const res = await deleteUserAccount(userId);
      if (res.error) toast.error(res.error);
      else toast.success(res.success);
      setConfirmOpen(false);
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Acciones para ${name}`}
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
          <DropdownMenuLabel className="truncate">{name}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setEditOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar datos
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setRolesOpen(true)}>
            <ShieldCheck className="mr-2 h-4 w-4" />
            Gestionar roles
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled={isSelf} onSelect={toggleDisabled}>
            {disabled ? (
              <>
                <UserCheck className="mr-2 h-4 w-4" />
                Reactivar cuenta
              </>
            ) : (
              <>
                <UserX className="mr-2 h-4 w-4" />
                Desactivar cuenta
              </>
            )}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            disabled={isSelf}
            onSelect={() => setConfirmOpen(true)}
            className="text-red-600 focus:text-red-600 dark:text-red-400"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar usuario
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar a {name}?</AlertDialogTitle>
            <AlertDialogDescription>
              Se borrará la cuenta y todos sus datos. Esta acción no se puede
              deshacer. Si solo quieres impedir que entre, desactiva la cuenta
              en su lugar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={pending}
              onClick={(e) => {
                e.preventDefault(); // no cierres hasta que termine la acción
                confirmDelete();
              }}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <EditUserDialog
        userId={userId}
        name={name}
        open={editOpen}
        onOpenChange={setEditOpen}
      />

      <ManageRolesDialog
        userId={userId}
        name={name}
        isSelf={isSelf}
        open={rolesOpen}
        onOpenChange={setRolesOpen}
      />
    </>
  );
}
