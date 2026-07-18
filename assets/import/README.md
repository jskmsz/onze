# Importar seus clubes e jogadores

**Onde:** menu → 🛠️ **Editor de mundo** → **📥 Importar CSV/JSON**
(pode selecionar os dois arquivos de uma vez).

Depois de importar, clique em **💾 Salvar mundo**: os clubes ficam
permanentes e toda carreira nova já começa com eles.

> Importe primeiro **clubes**, depois **jogadores** — os jogadores são
> ligados ao clube pela coluna `club` (aceita o nome completo ou a sigla).

---

## 1) `clubes.csv`

```
name,short,city,cityPop,founded,color,prestige,fans,x,y,badge,stadium,capacity,proximity,enclosure,pitch,kitPattern,kitShirt,kitShorts,kitSocks,kitDetail
KM Madraie,KSM,Dourn-Kêr,1100000,1905,#12b39b,95,95,0.460,0.340,assets/badges/madraie.png,Stade de Dourn-Kêr,71300,78,62,88,stripes,#12b39b,#ffffff,#12b39b,#ffffff
```

| Coluna | O que é | Padrão se vazio |
|---|---|---|
| `name` | nome do clube | obrigatório |
| `short` | sigla (até 4 letras) | do nome |
| `city` | cidade | do nome |
| `cityPop` | população (afeta público e prestígio) | 150000 |
| `founded` | ano de fundação | 1900 |
| `color` | cor principal `#rrggbb` | do molde |
| `prestige` | 1–100 (vira as estrelas) | 55 |
| `fans` | 20–98 fidelidade da torcida | = prestige |
| `x`, `y` | posição no mapa, **0 a 1** | aleatório |
| `badge` | caminho do escudo PNG | sem escudo |
| `stadium` | nome do estádio | "Stade de <cidade>" |
| `capacity` | lugares | 25000 |
| `proximity` | 0–100, torcida colada no gramado | 65 |
| `enclosure` | 0–100, cobertura/acústica | 55 |
| `pitch` | 0–100, estado do gramado | 82 |
| `kitPattern` | `solid`, `stripes`, `pinstripe`, `hoops`, `hoopsThin`, `sash`, `sashD`, `halves`, `quarters`, `center`, `chevron`, `shoulders`, `checker`, `gradient`, `waves` | solid |
| `kitShirt` / `kitShorts` / `kitSocks` / `kitDetail` | cores do uniforme | derivadas da cor |

**Coordenadas:** `x`/`y` vão de 0 a 1 sobre a imagem do mapa
(`0,0` = canto superior esquerdo). Se preferir, deixe em branco e depois
**clique no mapa** dentro do editor para posicionar cada clube.

---

## 2) `jogadores.csv`

> **Sem cabeçalho também funciona.** O importador descobre o formato pela
> coluna de posição (`GOL/ZAG/LAT/VOL/MEI/PON/ATA`):
> - posição na **2ª** coluna → `name,pos,age,nat,overall,potential`
> - posição na **3ª** coluna → `club,name,pos,age,nat,overall,potential`
>
> Se o arquivo **não tiver a coluna `club`**, os jogadores vão para o clube
> **selecionado na lista** do editor — ou para o clube com o mesmo nome do
> arquivo (ex.: `KS Madraie.csv` → clube "KS Madraie").

O jeito rápido: informe só `overall` e a **posição** — os 12 atributos são
gerados com o perfil da posição e calibrados para bater com esse overall.

```
club,name,pos,age,nat,overall,potential
KM Madraie,Yann Le Braz,GOL,29,dou,84,86
KM Madraie,Bruno Sakai,ATA,28,jp,86,86
```

Quer controle total? Preencha as colunas de atributo que quiser — elas
sobrescrevem o valor gerado (as demais continuam automáticas):

```
club,name,pos,age,nat,overall,potential,pace,passing,vision,finishing
KM Madraie,Marcelo Andrade,MEI,23,br,83,93,82,90,91,74
```

| Coluna | Valores |
|---|---|
| `club` | nome ou sigla do clube (precisa existir) |
| `pos` | `GOL`, `ZAG`, `LAT`, `VOL`, `MEI`, `PON`, `ATA` |
| `age` | 15–45 |
| `nat` | código do país: `dou` (Dournéa), `br`, `pt`, `jp`, `ar`, `es`, `fr`… (196 países). **Código inventado** (ex.: `ull`, `gua`) vira uma nação personalizada com bandeira 🏴 em vez de sumir |
| `overall` | 20–99 |
| `potential` | teto de evolução (≥ overall) |
| atributos | `pace, stamina, strength, tackling, marking, passing, vision, dribbling, technique, finishing, positioning, goalkeeping` (20–99) |

Clubes com menos de 16 jogadores recebem reservas geradas
automaticamente, para sempre ser possível escalar um XI.

---

## 3) Alternativa: um único JSON

```json
{
  "clubs": [
    {
      "name": "KM Madraie", "short": "KSM", "city": "Dourn-Kêr",
      "cityPop": 1100000, "founded": 1905, "color": "#12b39b",
      "prestige": 95, "x": 0.46, "y": 0.34,
      "stadium": "Stade de Dourn-Kêr", "capacity": 71300,
      "kitPattern": "stripes",
      "players": [
        {"name": "Yann Le Braz", "pos": "GOL", "age": 29, "nat": "dou", "overall": 84},
        {"name": "Marcelo Andrade", "pos": "MEI", "age": 23, "nat": "br",
         "overall": 83, "potential": 93, "attrs_note": "pode usar as colunas de atributo aqui também"}
      ]
    }
  ]
}
```

---

---

## Onde os imports ficam salvos?

No **IndexedDB do navegador**, na chave `worldTemplate` (banco `onze-db`,
store `data`) — junto com todas as edições do editor. **Não é um arquivo.**
É por isso que o mundo continua igual quando você reabre o jogo.

O save da *carreira* é separado (chave `auto`), então mexer no mundo não
apaga a temporada em andamento.

### Deu errado? Como voltar
1. **↩️ Desfazer importação** — volta ao estado logo antes do último
   import/remoção (o editor guarda um ponto de retorno automático).
2. **🧹 Limpar clubes vazios** — apaga de uma vez os clubes com nome
   automático `Clube 22`, `Clube 23`… criados por engano.
3. **🗑 Excluir clube** — no painel do clube, apaga um específico.
4. **🎲 Aleatório** — descarta o mundo salvo e sorteia outro do zero.
5. Costume saudável: **⤓ Exportar** antes de importar em massa.

---

## Dicas

- **Escudos**: coloque os PNGs em `assets/badges/` e aponte na coluna `badge`.
  Use **caminho de arquivo**, não imagem embutida — o save fica pequeno.
- **Cuidado com o Windows**: ao renomear, ele esconde a extensão e pode
  criar `arquivo.png.png`. Confirme o nome real antes.
- **Número ímpar de clubes** funciona: o calendário dá folga a um time por
  rodada automaticamente.
- Depois de importar, use **⤓ Exportar** para guardar o mundo inteiro como
  JSON (bom para versionar no git).
