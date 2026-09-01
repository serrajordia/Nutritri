---
name: plano-alimentar
description: Converte um documento de orientações nutricionais (Word, PDF, ou texto colado) em uma planilha .xlsx no formato que o app Nutritri importa. Use quando o usuário anexar ou colar um plano alimentar escrito por uma nutricionista e pedir para estruturar/converter/importar esse plano para o app.
---

# Estruturar plano alimentar para o Nutritri

Esta skill transforma um documento de orientações nutricionais — normalmente texto livre, escrito
por uma nutricionista, sem formato fixo — em uma planilha `.xlsx` que a tela de importação do app
Nutritri (`app/plan/import.tsx`) sabe ler.

O app não tem backend: não há como esta conversa "enviar" dados direto para o celular do usuário.
O fluxo real é: você gera o `.xlsx` aqui, entrega o arquivo ao usuário, e ele importa esse arquivo
pelo app. Deixe isso claro se o usuário esperar algo mais automático.

## Passo a passo

1. **Leia o documento** que o usuário forneceu (Word, PDF, ou texto colado na conversa). Pode
   cobrir um ou vários dias da semana, e uma ou mais refeições por dia. O texto costuma ser em
   prosa livre ("Segunda e quarta: café da manhã — 2 ovos mexidos, 1 fatia de pão integral..."),
   não uma tabela pronta.

2. **Extraia, para cada refeição mencionada:**
   - **Dia da semana**
   - **Nome da refeição** (ex: "Café da manhã", "Almoço" — mantenha os nomes que a nutricionista
     usou; não precisa forçar os 5 nomes padrão do app, o app aceita refeições extras)
   - **Horário**, se o documento mencionar um (ex: "07:30"). Deixe em branco se não houver.
   - **Texto da orientação**: o conteúdo em si (o que comer, quantidades, substituições sugeridas).
     Preserve o texto da nutricionista o quanto possível — não resuma nem reescreva o conteúdo
     nutricional, só limpe formatação estranha do documento de origem.

3. **Normalize os dias da semana** para exatamente um destes nomes (o app não reconhece
   abreviações): `Domingo`, `Segunda`, `Terça`, `Quarta`, `Quinta`, `Sexta`, `Sábado`.
   Exemplos de mapeamento: "seg" / "2ª feira" / "segunda-feira" → `Segunda`; "ter" / "3ª" → `Terça`.
   Se o documento disser algo como "todos os dias" ou "dias úteis", gere uma linha por dia
   abrangido (uma linha por Segunda, uma por Terça, etc.) — não crie um valor de dia agregado, o
   app só entende os 7 nomes acima.

4. **Gere um arquivo `.xlsx`** usando a skill `xlsx` deste ambiente, com:
   - Uma única aba chamada exatamente **`Plano Alimentar`**.
   - Colunas, nesta ordem e com estes nomes exatos (é o que `app/plan/import.tsx` procura):
     `Dia da semana`, `Refeição`, `Horário`, `Orientação`.
   - Uma linha por refeição por dia (se a mesma refeição se repete em vários dias, repita a linha
     para cada dia — não agrupe dias numa célula só).
   - Não crie abas extras nem renomeie as colunas: a importação no app depende desses nomes
     exatos.

5. **Entregue o arquivo ao usuário** (com `SendUserFile`, status `normal`) e explique em 1-2
   frases o próximo passo: baixar/salvar esse `.xlsx` no celular e abrir o Nutritri em
   Início → Ferramentas → "Importar plano (.xlsx)" para carregá-lo. Avise que a importação
   **substitui** as refeições dos dias presentes no arquivo — vale a pena revisar a planilha antes
   de importar se o paciente já tiver orientações próprias cadastradas naqueles dias.

## Quando pedir esclarecimento

- Se o documento não deixar claro o dia da semana de uma orientação (ex: só diz "no café da
  manhã", sem indicar quais dias), pergunte ao usuário antes de assumir todos os dias — ou assuma
  todos os 7 dias apenas se o contexto deixar isso razoavelmente óbvio (ex: um plano que claramente
  é o mesmo todo dia).
- Se o texto for ambíguo sobre quantidade/substituição, não invente informação nutricional — copie
  o texto original literalmente nesses trechos.
