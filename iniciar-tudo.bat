@echo off
echo Iniciando Espalhe Melodias (Frontend + Backend)...
echo.

:: Inicia o backend em nova janela
start "Backend API :3001" cmd /k "cd /d "%~dp0server" && "C:\Users\Eduardo\AppData\Local\nvs\default\node.exe" "./node_modules/tsx/dist/cli.mjs" src/server.ts"

:: Aguarda 3 segundos para o backend subir
timeout /t 3 /nobreak > nul

:: Inicia o frontend em nova janela
start "Frontend Vite :3000" cmd /k "cd /d "%~dp0" && "C:\Users\Eduardo\AppData\Local\nvs\default\node.exe" "./node_modules/vite/bin/vite.js" --port 3000"

echo.
echo Backend:  http://localhost:3001
echo Frontend: http://localhost:3000
echo.
echo Pressione qualquer tecla para fechar esta janela...
pause > nul
