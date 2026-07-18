@echo off
title Onze - Ligue de Dournea
cd /d "%~dp0"

echo.
echo   ============================================
echo      ONZE - Ligue de Dournea
echo   ============================================
echo.
echo   Abrindo o jogo no navegador...
echo   http://localhost:8123/game.html
echo.
echo   IMPORTANTE: deixe esta janela preta ABERTA
echo   enquanto joga. Para sair, feche-a ou tecle Ctrl+C.
echo.

rem procura o Python (python ou py)
where python >nul 2>nul
if %errorlevel%==0 (
    start "" "http://localhost:8123/game.html"
    python -m http.server 8123
    goto fim
)
where py >nul 2>nul
if %errorlevel%==0 (
    start "" "http://localhost:8123/game.html"
    py -m http.server 8123
    goto fim
)

echo   ERRO: Python nao encontrado no PATH.
echo   Instale em https://python.org e marque "Add Python to PATH".
pause

:fim
