"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { transferInputSchema, type TransferInput } from "@/lib/validations";
import type { Player, Sport, Team } from "@/types";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

interface NewTransferButtonProps {
  teams: Team[];
  players: Player[];
}

const inputClass =
  "h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";
const labelClass = "text-sm font-semibold";

const STATUS_OPTIONS: TransferInput["status"][] = ["RUMOR", "REPORTED", "NEGOTIATING", "MEDICAL", "CONFIRMED"];

export function NewTransferButton({ teams, players }: NewTransferButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<TransferInput>({
    resolver: zodResolver(transferInputSchema),
    defaultValues: {
      playerName: "",
      playerId: "",
      fromTeamId: "",
      toTeamId: "",
      status: "RUMOR",
      feeAmount: "",
      source: "",
      sourceUrl: "",
      sport: "FOOTBALL",
    },
  });

  const selectedSport = form.watch("sport") as Sport;
  const filteredTeams = useMemo(() => teams.filter((t) => t.sport === selectedSport), [teams, selectedSport]);
  const filteredPlayers = useMemo(() => players.filter((p) => p.sport === selectedSport), [players, selectedSport]);

  function handleClose() {
    setOpen(false);
    setFormError(null);
    form.reset();
  }

  async function onSubmit(values: TransferInput) {
    setFormError(null);
    try {
      const res = await fetch("/api/admin/transfers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error ?? "Failed to log transfer.");
        return;
      }
      handleClose();
      router.refresh();
    } catch {
      setFormError("Network error while saving.");
    }
  }

  return (
    <>
      <Button type="button" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" aria-hidden />
        New Transfer
      </Button>

      <Modal open={open} onClose={handleClose} ariaLabel="Log a new transfer">
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 px-6 pb-6">
          <h2 className="font-display text-lg font-bold">Log a Transfer</h2>

          {formError ? <p className="text-sm font-semibold text-red-500">{formError}</p> : null}

          <div className="flex flex-col gap-1.5">
            <label className={labelClass} htmlFor="sport">
              Sport
            </label>
            <select id="sport" className={inputClass} {...form.register("sport")}>
              <option value="FOOTBALL">Football</option>
              <option value="NBA">NBA</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelClass} htmlFor="playerName">
              Player name
            </label>
            <input id="playerName" className={inputClass} {...form.register("playerName")} />
            {form.formState.errors.playerName ? (
              <p className="text-xs text-red-500">{form.formState.errors.playerName.message}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelClass} htmlFor="playerId">
              Link to player (optional)
            </label>
            <select id="playerId" className={inputClass} {...form.register("playerId")}>
              <option value="">None</option>
              {filteredPlayers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className={labelClass} htmlFor="fromTeamId">
                From club
              </label>
              <select id="fromTeamId" className={inputClass} {...form.register("fromTeamId")}>
                <option value="">Unattached</option>
                {filteredTeams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelClass} htmlFor="toTeamId">
                To club
              </label>
              <select id="toTeamId" className={inputClass} {...form.register("toTeamId")}>
                <option value="">Unconfirmed</option>
                {filteredTeams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelClass} htmlFor="status">
              Status
            </label>
            <select id="status" className={inputClass} {...form.register("status")}>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelClass} htmlFor="feeAmount">
              Fee (optional)
            </label>
            <input id="feeAmount" placeholder="e.g. €60m" className={inputClass} {...form.register("feeAmount")} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelClass} htmlFor="source">
              Source
            </label>
            <input id="source" className={inputClass} {...form.register("source")} />
            {form.formState.errors.source ? (
              <p className="text-xs text-red-500">{form.formState.errors.source.message}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={labelClass} htmlFor="sourceUrl">
              Source URL (optional)
            </label>
            <input id="sourceUrl" placeholder="https://…" className={inputClass} {...form.register("sourceUrl")} />
          </div>

          <div className="mt-1 flex items-center gap-3">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Saving…" : "Save Transfer"}
            </Button>
            <Button type="button" variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
