# Nutritri

> O nome **Nutritri** é uma homenagem à nutricionista Ruth Lemos, que originou o meme "sanduicheiche".

## Para que serve

O Nutritri é um app para ajudar **paciente e profissional de nutrição** a manter uma dieta
saudável no dia a dia. A ideia é aproximar o app de treino que você já conhece: em vez de dias com
exercícios, o Nutritri organiza a semana em dias com **refeições**.

Cada perfil de paciente tem um plano alimentar semanal (café da manhã, lanche da manhã, almoço,
lanche da tarde, jantar — e outras refeições podem ser adicionadas) com as orientações passadas
pela nutricionista. O paciente registra cada refeição como "realizada", dá um escore de 0 a 5 de
quão bem seguiu a orientação, e ao final do dia avalia sua adesão geral. O app também mantém uma
ficha de saúde (peso, altura, idade, frequência cardíaca de repouso, bioimpedância) e permite
exportar tudo em uma planilha (.xlsx) para compartilhar com a nutricionista.

Funciona em iOS, Android e web a partir da mesma base de código (React Native + Expo), com foco
inicial em uso mobile — pensado primeiro para usuários de iPhone, mas preparado para Android desde
já.

## Como instalar no celular

Hoje o app está em fase de desenvolvimento, então a instalação é feita através do app gratuito
**Expo Go**. É rápido:

**1. Em um computador**, com [Node.js](https://nodejs.org) instalado, baixe o projeto e inicie o
servidor de desenvolvimento:

```bash
git clone https://github.com/serrajordia/Nutritri.git
cd Nutritri
npm install
npx expo start
```

Isso vai mostrar um QR code no terminal.

**2. No celular**, instale o Expo Go:

- iOS: [Expo Go na App Store](https://apps.apple.com/app/expo-go/id982107779)
- Android: [Expo Go na Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

**3. Escaneie o QR code**:

- No iPhone: abra a câmera nativa, aponte para o QR code e toque na notificação que aparece.
- No Android: abra o app Expo Go e use o leitor de QR code dentro dele.

O celular precisa estar na mesma rede Wi-Fi que o computador. O Nutritri abre direto no celular, e
qualquer atualização no código recarrega o app automaticamente — sem precisar reinstalar nada.

> Esse fluxo (computador + Expo Go) é o jeito normal de testar um app Expo durante o
> desenvolvimento. Para gerar um instalável "de verdade" — que funcione sem depender de um
> computador ligado, e que possa ser publicado na App Store / Play Store — o próximo passo é
> configurar o [EAS Build](https://docs.expo.dev/build/introduction/) da Expo, ainda não feito
> neste projeto (exige conta Apple Developer paga).

## Alternativa gratuita: instalar como app web (PWA), sem PC ligado

Se você não quer depender do computador rodando o `npx expo start`, e não quer pagar a conta Apple
Developer só para testar, o Nutritri também roda como **PWA** ("app web" instalável) — funciona
sozinho no celular depois de instalado, sem servidor, de graça.

- **`.github/workflows/deploy-web.yml`**: a cada push na branch `main`, exporta a versão web
  (`npx expo export --platform web`) e publica no GitHub Pages automaticamente. Para ativar,
  habilite o GitHub Pages do repositório em Settings → Pages → Source: "GitHub Actions" (feito uma
  vez só).
- Depois de publicado, no iPhone: abra a URL do Pages no Safari → Compartilhar → **"Adicionar à
  Tela de Início"**. O app abre em tela cheia, com ícone próprio, como se fosse instalado de
  verdade.
- Os dados continuam 100% locais — o `AsyncStorage` usa `localStorage` do navegador
  automaticamente, nada muda no armazenamento.

Duas ressalvas técnicas, se for mexer nesse fluxo:
- O export web usa modo "single" (SPA) de propósito — testamos com pré-renderização estática e ela
  causa um erro de hydration do React, porque o app depende de dados só disponíveis no navegador
  (`localStorage`). Não trocar `web.output` para `"static"` em `app.json` sem resolver isso antes.
- Como é uma SPA, recarregar a página numa rota como `/day/1` só funciona porque o workflow copia
  `index.html` para `404.html` no output (o "truque" padrão de SPA no GitHub Pages: qualquer
  caminho sem arquivo correspondente cai no `404.html`, que serve o mesmo app, e o roteador do
  Expo Router assume a partir da URL real). Se trocar de hospedagem, replicar esse comportamento
  (Vercel/Netlify fazem isso com uma regra de rewrite em vez do truque do 404).

## Funcionalidades da v1

- **Perfis de paciente**: crie e alterne entre múltiplos perfis.
- **Semana com botões por dia**: Domingo a Sábado, cada um mostrando quantas refeições já foram
  registradas e o escore do dia.
- **Plano alimentar editável por dia da semana**: cada refeição tem nome, horário e orientação em
  texto livre; é possível adicionar/remover refeições além das 5 básicas.
- **Registro de refeição**: marcar como realizada + escore de adesão (0-5) + observações.
- **Escore diário**: avaliação geral de adesão ao final do dia.
- **Ficha de saúde**: histórico de altura, peso, idade, frequência cardíaca de repouso (compatível
  com leitura futura de smartwatch) e dados de bioimpedância (gordura corporal, massa muscular,
  água corporal, gordura visceral, massa óssea, taxa metabólica basal).
- **Exportação em .xlsx**: gera uma planilha com plano alimentar, registros de refeições, escores
  diários e ficha de saúde, pronta para compartilhar com a nutricionista pelo menu de
  compartilhamento nativo do celular.
- **Importação de plano alimentar em .xlsx**: carrega de uma vez as orientações de um ou mais dias
  a partir de uma planilha (aba "Plano Alimentar", colunas "Dia da semana", "Refeição", "Horário",
  "Orientação" — o mesmo formato que a exportação já produz). Pensada para funcionar junto com a
  skill do Claude Code `plano-alimentar` (ver abaixo), que transforma um documento Word/PDF da
  nutricionista nesse formato.

Os dados ficam salvos localmente no aparelho (AsyncStorage); a exportação em xlsx é o mecanismo de
compartilhamento com o profissional nesta primeira versão.

Stack: Expo SDK 54, React Native 0.81, TypeScript, Expo Router (navegação por arquivos),
AsyncStorage (persistência local), SheetJS/`xlsx` (exportação e importação), `expo-sharing`
(compartilhamento), `expo-document-picker` (seleção de arquivo para importar), `react-native-web`
(versão web/PWA).

### Importar o plano alimentar de um documento da nutricionista

O Nutritri não tem backend, então não há como um chat do Claude "enviar" dados direto para o
celular — o fluxo é em duas etapas manuais:

1. Neste projeto, no Claude Code, anexe o documento da nutricionista (Word, PDF ou texto colado) e
   peça para rodar a skill `plano-alimentar` (`.claude/skills/plano-alimentar/`). Ela devolve uma
   planilha `.xlsx` já estruturada.
2. No app, vá em **Início → Ferramentas → "Importar plano (.xlsx)"**, selecione esse arquivo salvo
   no celular e confirme. As orientações dos dias presentes no arquivo são **substituídas** pelas
   importadas — vale revisar a planilha antes se já houver orientações cadastradas nesses dias.

## Estrutura

```
app/            telas (Expo Router)
  index.tsx       seleção/criação de perfil
  home.tsx        semana com botões por dia
  day/[weekday]   refeições do dia + escore diário
  meal/[weekday]/[mealId]   orientação da refeição + registro
  plan/[weekday]  edição das orientações (nutricionista)
  plan/import.tsx importação de plano alimentar via .xlsx
  health/         ficha de saúde (histórico + novo registro)
  export.tsx      geração e compartilhamento do xlsx
src/            lógica compartilhada
  types.ts        modelos de dados
  storage.ts      persistência (AsyncStorage)
  AppContext.tsx  estado global e mutações
  exportXlsx.ts   geração da planilha
  importXlsx.ts   leitura e validação da planilha de importação
  ui.tsx          componentes visuais reutilizáveis
.claude/skills/plano-alimentar/  skill do Claude Code que estrutura o documento da nutricionista
public/         arquivos estáticos da versão web (manifest.json, ícone) copiados como estão
.github/workflows/deploy-web.yml  publica a versão web no GitHub Pages a cada push em main
```

## Fila de melhorias (próximos passos)

1. Dashboard de evolução (peso, bioimpedância e adesão ao longo do tempo)
2. Registro de fotos das refeições
3. Avaliação das fotos por IA com estimativa de quantidades consumidas
4. Registro de feedback do profissional de nutrição
5. Envio automático de informações ao profissional de nutrição (hoje é manual via exportação xlsx)
6. Chat com IA para dúvidas e feedback ao paciente
