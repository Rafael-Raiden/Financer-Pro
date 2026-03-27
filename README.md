# 💰 Financer Pro — PWA

Gerenciador financeiro pessoal completo. Funciona online e offline como aplicativo instalável (PWA).

## 🚀 Deploy no Vercel (recomendado)

### Opção 1 — Interface do Vercel (mais fácil)
1. Crie uma conta em [vercel.com](https://vercel.com)
2. Clique em **"Add New Project"**
3. Conecte seu GitHub e selecione o repositório `financer-pro`
4. Clique em **Deploy** — pronto!

### Opção 2 — Vercel CLI
```bash
npm i -g vercel
vercel --prod
```

## 📱 Instalar no celular como app

### Android (Chrome)
1. Abra o app no Chrome
2. Menu `⋮` → **"Adicionar à tela inicial"**
3. Confirme a instalação

### iPhone (Safari)
1. Abra o app no Safari
2. Botão de compartilhar `⎙` → **"Adicionar à Tela de Início"**
3. Confirme

## ⚙️ Configurar o Google Sheets (backend)

1. Acesse [script.google.com](https://script.google.com)
2. Clique em **"Novo projeto"**
3. Cole o conteúdo do arquivo `FinanceiroApp_AppsScript.js`
4. Salve (Ctrl+S) e execute a função `inicializarPlanilha()`
5. Vá em **Implantar → Nova implantação**
   - Tipo: **Aplicativo da Web**
   - Executar como: **Você**
   - Quem pode acessar: **Qualquer pessoa**
6. Copie a URL gerada
7. No app, vá em **Configurações** e cole a URL

## 📁 Estrutura do projeto

```
financer-pro/
├── index.html          # App completo (HTML + CSS + JS)
├── manifest.json       # Configuração PWA
├── sw.js               # Service Worker (offline)
├── vercel.json         # Configuração Vercel
├── icons/              # Ícones do app (gere em realfavicongenerator.net)
│   ├── icon-192.png
│   ├── icon-512.png
│   └── ...
└── README.md
```

## 🎨 Gerar os ícones

1. Acesse [realfavicongenerator.net](https://realfavicongenerator.net)
2. Faça upload de uma imagem 512×512px com o logo
3. Baixe o pacote e coloque os PNG na pasta `icons/`

## 🌟 Funcionalidades

- 📊 Dashboard com gráficos e resumo financeiro
- 💸 Lançamento de receitas e despesas
- 💳 Controle de cartões de crédito com parcelamento
- 🏆 Metas de economia com progresso
- 📈 Controle de investimentos
- 🔴 Controle de dívidas
- 🔄 Transações recorrentes automáticas
- 📥 Importação de CSV bancário (Nubank, Inter, Itaú, BB...)
- 📋 Relatórios mensais e por categoria
- 🌙 Modo escuro/claro
- 📱 Responsivo para celular, tablet e desktop
- ✈️ Funciona offline (Service Worker)

## 🔧 Requisitos

- Apenas um navegador moderno (Chrome, Safari, Firefox, Edge)
- Conta Google para o backend (Google Sheets + Apps Script)
- Hospedagem gratuita: Vercel, GitHub Pages ou Netlify
