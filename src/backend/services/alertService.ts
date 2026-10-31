import { findActiveDiscordWebhook } from "../models/settingsModel";

export async function sendTestAlert(): Promise<void> {
  const webhook = await findActiveDiscordWebhook();
  if (!webhook) {
    throw Object.assign(new Error("Aucun webhook Discord actif n’est configuré."), { status: 400 });
  }

  const response = await fetch(webhook, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ content: "Test de notification — Nightshift DevOps Control" }),
    signal: AbortSignal.timeout(5000),
    redirect: "error",
  });
  if (!response.ok) {
    throw Object.assign(new Error(`Discord a répondu avec le statut ${response.status}.`), { status: 502 });
  }
}
