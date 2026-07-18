# Onze — Ligue de Dournéa

Simulador de gestão de futebol rodando 100% local no navegador. Dournéa é uma
nação fictícia de fala bretã/francesa com clima parecido com a Islândia.

## Como jogar
Dê dois cliques em **`Jogar Onze.bat`** (liga um servidor local e abre o jogo).
Deixe a janela preta aberta enquanto joga. Alternativa manual:

```
python -m http.server 8123
```
e abra http://localhost:8123/game.html

> O jogo precisa ser servido por http:// — abrir `game.html` direto (file://)
> não funciona porque o navegador bloqueia os módulos ES.

## Estrutura
- `game.html` — casca da interface
- `css/game.css` — estilos
- `js/core.js` — **motor** (mundo, partida, finanças, treino, mercado, clima) — sem dependência de navegador
- `js/app.js` — interface e controle
- `js/storage.js` — salvar/carregar (IndexedDB + import/export .json)
- `match-engine.html`, `positional.html` — protótipos antigos (referência)

## Reverter mudanças
Este projeto está sob git. Para voltar a um estado anterior:
```
git log --oneline          # ver os commits
git checkout <hash> -- .    # traz os arquivos daquele commit (sem apagar histórico)
```
