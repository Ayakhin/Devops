import type { Request, Response } from "express";
import type { Setting } from "../models/domain";
import * as settingsModel from "../models/settingsModel";

const settingTypes = new Set<Setting["type"]>(["alert", "discord_webhook", "metric_threshold", "service"]);

function parseSetting(body: unknown): Omit<Setting, "id"> | null {
  if (typeof body !== "object" || body === null) return null;
  const value = body as Record<string, unknown>;
  if (
    typeof value.name !== "string" ||
    value.name.trim().length === 0 ||
    value.name.length > 120 ||
    typeof value.value !== "string" ||
    !settingTypes.has(value.type as Setting["type"]) ||
    typeof value.active !== "boolean"
  ) {
    return null;
  }
  if (value.type === "discord_webhook") {
    try {
      const url = new URL(value.value);
      if (url.protocol !== "https:" || !/^\/api\/webhooks\/[^/]+\/[^/]+\/?$/.test(url.pathname) ||
          !["discord.com", "discordapp.com"].includes(url.hostname)) return null;
    } catch {
      return null;
    }
  }
  return {
    name: value.name.trim(),
    type: value.type as Setting["type"],
    value: value.value.trim(),
    active: value.active,
  };
}

function parseId(id: string): number | null {
  const number = Number(id);
  return Number.isSafeInteger(number) && number > 0 ? number : null;
}

export async function getSettings(_request: Request, response: Response): Promise<void> {
  response.json({ data: await settingsModel.listSettings() });
}

export async function createSetting(request: Request, response: Response): Promise<void> {
  const setting = parseSetting(request.body);
  if (!setting) {
    response.status(400).json({ error: "Paramètres invalides. Vérifiez le nom, le type, la valeur et l’état actif." });
    return;
  }
  response.status(201).json({ data: await settingsModel.createSetting(setting) });
}

export async function updateSetting(request: Request, response: Response): Promise<void> {
  const id = parseId(request.params.id);
  const setting = parseSetting(request.body);
  if (!id || !setting) {
    response.status(400).json({ error: "Identifiant ou paramètres invalides." });
    return;
  }
  if (!(await settingsModel.updateSetting(id, setting))) {
    response.status(404).json({ error: "Paramètre introuvable." });
    return;
  }
  response.json({ data: { id, ...setting } });
}

export async function deleteSetting(request: Request, response: Response): Promise<void> {
  const id = parseId(request.params.id);
  if (!id) {
    response.status(400).json({ error: "Identifiant invalide." });
    return;
  }
  if (!(await settingsModel.deleteSetting(id))) {
    response.status(404).json({ error: "Paramètre introuvable." });
    return;
  }
  response.status(204).end();
}
