# Trading Bot — Projeto Acadêmico

Aplicativo mobile de **bot de trading automatizado** para a B3 (Bolsa de Valores Brasileira), desenvolvido com backend em Python e frontend em React Native.

> 🎓 Projeto acadêmico — opera exclusivamente em modo **paper trading** (simulação sem dinheiro real).

---

## 📱 Visão Geral

O sistema simula um robô de trading que aplica a estratégia de **cruzamento de médias móveis (MA Crossover)** em ativos da B3. O usuário pode configurar parâmetros, acompanhar operações em tempo real, realizar backtests e executar ordens manualmente.

### Telas do aplicativo

| Tela | Descrição |
|---|---|
| **Dashboard** | Gráfico de preço + MAs em tempo real, saldo simulado, P/L do dia, controle do bot |
| **Estratégia** | Configuração do ativo, timeframe, períodos das MAs, stop loss e take profit |
| **Backtest** | Simulação histórica com equity curve, win rate, max drawdown, Sharpe Ratio |
| **Trades** | Execução manual de ordens de compra/venda, posição aberta, histórico |
| **Logs** | Histórico completo de ações do bot com filtros por nível |
| **Configurações** | API keys, saldo simulado, modo paper trading, tema claro/escuro |

---

## 🛠️ Tecnologias

### Backend
- **Python 3.11** + **FastAPI** — API REST assíncrona
- **PostgreSQL 15** — banco de dados relacional
- **SQLAlchemy** (async) — ORM
- **Pandas / NumPy** — análise técnica e backtesting
- **Docker** — containerização do ambiente

### Mobile
- **React Native** (Expo SDK 50)
- **TypeScript** — tipagem estática em todo o frontend
- **Zustand** — gerenciamento de estado
- **React Navigation** — navegação por abas
- **react-native-chart-kit** — gráficos de linha

---

## 📁 Estrutura do Projeto

```
leonardo_projeto/
├── backend/
│   ├── app/
│   │   ├── api/endpoints/      # auth, dashboard, strategy, backtest, trades, logs, settings
│   │   ├── core/               # config, database, security
│   │   ├── models/             # SQLAlchemy ORM (user, strategy, trade, backtest, log, settings)
│   │   ├── schemas/            # Pydantic schemas
│   │   ├── services/           # bot_manager, backtesting_service, metatrader_service, technical_analysis_service
│   │   └── main.py
│   ├── Dockerfile
│   └── requirements.txt
│
├── mobile/
│   ├── src/
│   │   ├── components/         # componentes reutilizáveis
│   │   ├── navigation/         # configuração de abas
│   │   ├── screens/            # Dashboard, Strategy, Backtest, Trades, Logs, Settings
│   │   ├── services/           # cliente HTTP (axios)
│   │   ├── store/              # authStore, strategyStore, themeStore (Zustand)
│   │   └── types/              # interfaces TypeScript
│   ├── App.tsx
│   └── package.json
│
├── docker-compose.yml
└── README.md
```

---

## 🚀 Como Executar

### Pré-requisitos
- [Docker](https://www.docker.com/) e Docker Compose
- [Node.js 18+](https://nodejs.org/) e npm
- [Expo Go](https://expo.dev/client) no celular (opcional)

### 1. Backend (Docker)

```bash
# Na raiz do projeto
docker compose up -d
```

A API estará disponível em `http://localhost:8000`
Documentação interativa (Swagger): `http://localhost:8000/docs`

### 2. Mobile

```bash
cd mobile
npm install
npx expo start
```

Escaneie o QR code com o app **Expo Go**, ou pressione `a` para Android / `i` para iOS.

> **Atenção:** se usar dispositivo físico, substitua `localhost` em `src/services/api.ts` pelo IP da sua máquina na rede local.

---

## 📊 Como Funciona o Bot

O bot executa um loop a cada **30 segundos** com os seguintes passos:

1. Busca a estratégia ativa do usuário no banco de dados
2. Simula o preço do ativo com **random walk** (volatilidade realista ~0,5%/ciclo)
3. Calcula as **médias móveis** (MA curta e MA longa)
4. Detecta **cruzamentos**:
   - MA curta cruza **acima** da longa → sinal de **COMPRA**
   - MA curta cruza **abaixo** da longa → sinal de **VENDA**
5. Aplica **stop loss** e **take profit** automáticos
6. Registra trades e logs no banco de dados

---

## 🔒 Segurança

- Autenticação **JWT** com expiração configurável
- Senhas hasheadas com **bcrypt**
- API Keys criptografadas no banco
- Validação de dados com **Pydantic v2**

---

## 🎨 Design

Interface minimalista em tema escuro com paleta desaturada:

| Token | Cor | Uso |
|---|---|---|
| `primary` | `#4f83f8` | Botões, destaques |
| `success` | `#34d399` | Compra, lucro, sucesso |
| `error` | `#f87171` | Venda, prejuízo, erro |
| `warning` | `#f59e0b` | Alertas |
| `background` | `#0d1117` | Fundo principal |
| `card` | `#1a2133` | Cards e containers |

---

## 📈 Indicadores Técnicos

- **SMA / EMA** — Médias Móveis Simples e Exponenciais
- **RSI** — Índice de Força Relativa
- **MACD** — Moving Average Convergence Divergence
- **Bandas de Bollinger**

---

## ⚠️ Aviso

Este projeto é **exclusivamente para fins acadêmicos**. Opera somente em modo paper trading (simulação). Não constitui recomendação de investimento. Trading envolve riscos — sempre teste estratégias antes de operar com capital real.
