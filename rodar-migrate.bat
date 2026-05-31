@echo off
echo Espalhe Melodias — Migrate e Seed do Banco
echo.
cd server

echo [1/2] Criando tabelas no banco...
"C:\Users\Eduardo\AppData\Local\nvs\default\node.exe" scripts/migrate.js

echo.
echo [2/2] Populando dados iniciais...
"C:\Users\Eduardo\AppData\Local\nvs\default\node.exe" scripts/seed.js

echo.
echo Pronto! Banco configurado.
pause
