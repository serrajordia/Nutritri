# Nutritri

App para ajudar paciente e profissional de nutrição a manter hábitos alimentícios saudáveis.

Funciona em iOS, Android e web a partir da mesma base de código (React Native + Expo), com foco
inicial em uso mobile.

## Conceito

Assim como um app de treino organiza a semana em dias com exercícios, o Nutritri organiza a semana
em dias com **refeições**. Cada perfil de paciente tem um plano alimentar semanal (café da manhã,
lanche da manhã, almoço, lanche da tarde, jantar — e outras refeições podem ser adicionadas) com as
orientações passadas pela nutricionista. O paciente registra cada refeição como "realizada",
atribui um escore de 0 a 5 de quão bem seguiu a orientação, e também avalia o dia como um todo.

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

Os dados ficam salvos localmente no aparelho (AsyncStorage); a exportação em xlsx é o mecanismo de
compartilhamento com o profissional nesta primeira versão.

## Rodando o projeto

```bash
npm install
npx expo start
```

Abra no app **Expo Go** (iOS/Android) escaneando o QR code, ou pressione `i`/`a` para abrir em um
simulador/emulador, ou `w` para rodar no navegador.

Stack: Expo SDK 57, React Native 0.86, TypeScript, Expo Router (navegação por arquivos),
AsyncStorage (persistência local), SheetJS/`xlsx` (exportação), `expo-sharing` (compartilhamento).

## Estrutura

```
app/            telas (Expo Router)
  index.tsx       seleção/criação de perfil
  home.tsx        semana com botões por dia
  day/[weekday]   refeições do dia + escore diário
  meal/[weekday]/[mealId]   orientação da refeição + registro
  plan/[weekday]  edição das orientações (nutricionista)
  health/         ficha de saúde (histórico + novo registro)
  export.tsx      geração e compartilhamento do xlsx
src/            lógica compartilhada
  types.ts        modelos de dados
  storage.ts      persistência (AsyncStorage)
  AppContext.tsx  estado global e mutações
  exportXlsx.ts   geração da planilha
  ui.tsx          componentes visuais reutilizáveis
```

## Fila de melhorias (próximos passos)

1. Dashboard de evolução (peso, bioimpedância e adesão ao longo do tempo)
2. Registro de fotos das refeições
3. Avaliação das fotos por IA com estimativa de quantidades consumidas
4. Registro de feedback do profissional de nutrição
5. Envio automático de informações ao profissional de nutrição (hoje é manual via exportação xlsx)
6. Chat com IA para dúvidas e feedback ao paciente
