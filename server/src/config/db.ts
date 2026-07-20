import mysql from 'mysql2/promise';
import { config } from './index';

export const pool = mysql.createPool({
  host:               config.db.host,
  port:               config.db.port,
  user:               config.db.user,
  password:           config.db.password,
  database:           config.db.name,
  connectionLimit:    config.db.connectionLimit,
  charset:            'utf8mb4',
  timezone:           '+00:00',
  // Colunas DATE/DATETIME/TIMESTAMP voltam como string "YYYY-MM-DD[ HH:MM:SS]"
  // em vez de objeto Date do JS. Evita que o driver aplique conversão de timezone
  // ao ler datas "ingênuas" do banco (ex: event_date), que causava deslocamento
  // de ±1 dia ao serializar para JSON e depois fazer `new Date(str)` no frontend.
  dateStrings:        true,
  waitForConnections: true,
  queueLimit:         0,
});

type Params = mysql.QueryOptions['values'];

/** Wrapper conveniente para SELECT — retorna array de linhas. */
export async function query<T = unknown>(sql: string, params?: Params): Promise<T[]> {
  const [rows] = await pool.query(sql, params);
  return rows as T[];
}

/** Retorna apenas o primeiro resultado ou undefined. */
export async function queryOne<T = unknown>(sql: string, params?: Params): Promise<T | undefined> {
  const rows = await query<T>(sql, params);
  return rows[0];
}

/** Executa INSERT/UPDATE/DELETE e retorna o ResultSetHeader. */
export async function execute(sql: string, params?: Params): Promise<mysql.ResultSetHeader> {
  const [result] = await pool.query(sql, params);
  return result as mysql.ResultSetHeader;
}

export async function testConnection(): Promise<void> {
  const conn = await pool.getConnection();
  conn.release();
}
