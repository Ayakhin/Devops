import type { RowDataPacket } from "mysql2";
import { pool } from "../models/database";

interface DatabaseHealth {
  status: "up" | "down";
  latency: number | null;
  connections: number | null;
  sizeMb: number | null;
  error?: string;
}

export async function getDatabaseHealth(): Promise<DatabaseHealth> {
  interface StatusRow extends RowDataPacket { Value: string }
  interface SizeRow extends RowDataPacket { size_mb: number | null }

  const startedAt = performance.now();
  try {
    await pool.query("SELECT 1");
    const latency = Math.round(performance.now() - startedAt);
    const [connectionRows] = await pool.query<StatusRow[]>("SHOW GLOBAL STATUS LIKE 'Threads_connected'");
    const [sizeRows] = await pool.query<SizeRow[]>(
      "SELECT ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS size_mb FROM information_schema.tables WHERE table_schema = DATABASE()",
    );
    return {
      status: "up",
      latency,
      connections: Number(connectionRows[0]?.Value ?? 0),
      sizeMb: Number(sizeRows[0]?.size_mb ?? 0),
    };
  } catch (error) {
    return {
      status: "down",
      latency: null,
      connections: null,
      sizeMb: null,
      error: error instanceof Error ? error.message : "Connexion MySQL indisponible.",
    };
  }
}
