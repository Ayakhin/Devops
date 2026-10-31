import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { pool } from "./database";
import type { Setting } from "./domain";

interface SettingRow extends RowDataPacket {
  id: number;
  name: string;
  type: Setting["type"];
  value: string;
  active: number | boolean;
}

function mapSetting(row: SettingRow): Setting {
  return { ...row, active: Boolean(row.active) };
}

export async function listSettings(): Promise<Setting[]> {
  const [rows] = await pool.query<SettingRow[]>(
    "SELECT id, name, type, value, active FROM settings ORDER BY id DESC",
  );
  return rows.map(mapSetting);
}

export async function createSetting(setting: Omit<Setting, "id">): Promise<Setting> {
  const [result] = await pool.execute<ResultSetHeader>(
    "INSERT INTO settings (name, type, value, active) VALUES (?, ?, ?, ?)",
    [setting.name, setting.type, setting.value, setting.active],
  );
  return { id: result.insertId, ...setting };
}

export async function updateSetting(id: number, setting: Omit<Setting, "id">): Promise<boolean> {
  const [result] = await pool.execute<ResultSetHeader>(
    "UPDATE settings SET name = ?, type = ?, value = ?, active = ? WHERE id = ?",
    [setting.name, setting.type, setting.value, setting.active, id],
  );
  return result.affectedRows > 0;
}

export async function deleteSetting(id: number): Promise<boolean> {
  const [result] = await pool.execute<ResultSetHeader>("DELETE FROM settings WHERE id = ?", [id]);
  return result.affectedRows > 0;
}

export async function findActiveDiscordWebhook(): Promise<string | undefined> {
  const [rows] = await pool.query<SettingRow[]>(
    "SELECT id, name, type, value, active FROM settings WHERE type = 'discord_webhook' AND active = TRUE ORDER BY id DESC LIMIT 1",
  );
  return rows[0]?.value;
}
