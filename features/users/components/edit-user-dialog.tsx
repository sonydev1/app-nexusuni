"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getUserForEdit } from "../services/edit-user";
import type { EditUserData } from "../types/user-types";
import EditUserForm from "./edit-user-form";
import { FormSkeleton } from "@/components/skeleton";

type LoadState = { data: EditUserData } | { error: string } | null;

function EditUserLoader({
  userId,
  onSaved,
}: {
  userId: string;
  onSaved: (message: string) => void;
}) {
  const [state, setState] = useState<LoadState>(null);

  useEffect(() => {
    let cancelled = false;
    getUserForEdit(userId).then((res) => {
      if (!cancelled) setState(res);
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (!state) {
    return (
      <FormSkeleton
        label="Cargando datos del usuario…"
        sections={[
          { title: true, divider: true, fields: 5, full: 1 },
          { title: false, fields: 2 },
        ]}
      />
    );
  }
  if ("error" in state) {
    return <div className="alert-error">{state.error}</div>;
  }
  return <EditUserForm data={state.data} onSuccess={onSaved} />;
}

export default function EditUserDialog({
  userId,
  name,
  open,
  onOpenChange,
}: {
  userId: string;
  name: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar usuario</DialogTitle>
          <DialogDescription>{name}</DialogDescription>
        </DialogHeader>

        <EditUserLoader
          userId={userId}
          onSaved={(message) => {
            onOpenChange(false);
            toast.success(message);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
