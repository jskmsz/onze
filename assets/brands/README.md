# Banco de marcas (patrocinadores e fornecedores)

Para poucas marcas, use o **editor no jogo** (menu → 🏷️ Banco de marcas).
Para **centenas ou milhares**, monte um arquivo e importe.

## De onde o jogo lê (nesta ordem)
1. **IndexedDB** — o que você editou/importou no jogo (fica salvo sozinho)
2. **`assets/brands/brands.json`** — arquivo do projeto (bom para versionar no git)
3. Placeholders embutidos no código

## Regra de ouro para bancos grandes
Guarde o logo como **caminho de arquivo**, não como imagem embutida:

```json
{ "logo": "assets/brands/logos/nike.png" }
```

Assim os saves continuam pequenos e só os logos realmente usados são
carregados. Imagem enviada pelo editor vira `data:image/png;base64,...`,
o que é ótimo para 10 marcas e ruim para 1000.

## Campos

| Campo | O que é | Valores |
|---|---|---|
| `id` | identificador único | gerado do nome se faltar |
| `name` | nome exibido | texto |
| `short` | sigla no logo gerado | até 12 letras |
| `kind` | tipo | `sponsor` ou `supplier` (material) |
| `prestige` | prestígio da marca | 1–100 |
| `reach` | até onde é conhecida | `local`, `regional`, `nacional`, `continental`, `mundial` |
| `country` | origem | `dou` (Dournéa) ou outro código |
| `size` | porte da empresa (quanto pode pagar) | 1–100 |
| `color` | cor do logo gerado | `#rrggbb` |
| `logo` | caminho do PNG (ou vazio) | `assets/brands/logos/x.png` |
| `sector` | setor (só sabor/busca) | ex.: `aviação`, `banco`, `cerveja` |

## Como o valor é calculado
```
valor/rodada = prestígio_do_clube^1.45 × (prestígio_marca/55) × (porte/55) × peso_do_slot × 100
```
E a marca só negocia se o **alcance** dela estiver a no máximo 1 degrau do
alcance do clube (marca local não patrocina clube continental). Marca
estrangeira só aparece se for grande (continental ou mundial).

## CSV (para montar na planilha)
Exporte pelo editor (**⤓ CSV**) para ter o cabeçalho certo, edite no Excel /
Google Sheets e importe de volta (**⤒ Importar**). Cabeçalho:

```
id,name,short,kind,prestige,reach,country,size,color,logo,sector
```

Exemplo:
```
,Nike,NIKE,supplier,96,mundial,int,97,#111111,assets/brands/logos/nike.png,material esportivo
,Fly Emirates,EMIRATES,sponsor,95,mundial,int,96,#d71921,assets/brands/logos/emirates.png,aviação
,Padaria Kerdrec'h,KERPAD,sponsor,20,local,dou,18,#92400e,,alimentação
```
