/**
 * Script para executar migrations SQL
 * Uso: npx ts-node src/scripts/runMigration.ts
 */
import fs from 'fs';
import path from 'path';
import { pool } from '@/config/db';

async function runMigration(): Promise<void> {
  const migrationsDir = path.resolve(__dirname, './migrations');

  if (!fs.existsSync(migrationsDir)) {
    console.error('Diretório de migrations não encontrado:', migrationsDir);
    process.exit(1);
  }

  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  if (files.length === 0) {
    console.log('Nenhuma migration encontrada');
    process.exit(0);
  }

  console.log(`Encontradas ${files.length} migration(s)`);

  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf-8');

    console.log(`\n▶ Executando: ${file}`);

    try {
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      for (const statement of statements) {
        await pool.query(statement);
      }

      console.log(`✓ ${file} completado`);
    } catch (err) {
      console.error(`✗ Erro em ${file}:`, err);
      process.exit(1);
    }
  }

  console.log('\n✓ Todas as migrations foram executadas com sucesso!');
  process.exit(0);
}

runMigration().catch((err) => {
  console.error('Erro fatal:', err);
  process.exit(1);
});
