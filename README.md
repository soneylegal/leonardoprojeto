# Trading Bot - Projeto Completo

Um aplicativo mobile de bot de trading automatizado para a B3 (Bolsa de Valores Brasileira), com backend em Python e frontend em React Native.

## 📱 Visão Geral

Este projeto implementa um sistema completo de trading automatizado com:

- **Dashboard** - Visão geral do bot com gráficos em tempo real
- **Configuração de Estratégia** - Personalização de parâmetros de trading
- **Backtesting** - Validação de estratégias com dados históricos
- **Logs** - Histórico detalhado de todas as ações do bot
- **Configurações** - Gerenciamento de API keys e preferências
- **Paper Trading** - Simulação de trades sem risco real

## 🛠️ Tecnologias

### Backend
- **Python 3.11+**
- **FastAPI** - Framework web moderno e rápido
- **PostgreSQL** - Banco de dados relacional
- **SQLAlchemy** - ORM assíncrono
- **MetaTrader5** - Conexão com a B3
- **Pandas & Pandas-TA** - Análise técnica

### Mobile
- **React Native** (Expo)
- **TypeScript**
- **Zustand** - Gerenciamento de estado
- **React Navigation** - Navegação

## 📁 Estrutura do Projeto

```
bot_projeto/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── endpoints/
│   │   │       ├── auth.py
│   │   │       ├── dashboard.py
│   │   │       ├── strategy.py
│   │   │       ├── backtest.py
│   │   │       ├── trades.py
│   │   │       ├── logs.py
│   │   │       └── settings.py
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   ├── database.py
│   │   │   └── security.py
│   │   ├── models/
│   │   │   ├── user.py
│   │   │   ├── strategy.py
│   │   │   ├── trade.py
│   │   │   ├── backtest.py
│   │   │   ├── log.py
│   │   │   └── settings.py
│   │   ├── schemas/
│   │   │   └── schemas.py
│   │   ├── services/
│   │   │   ├── metatrader_service.py
│   │   │   ├── technical_analysis_service.py
│   │   │   ├── backtesting_service.py
│   │   │   └── bot_manager.py
│   │   └── main.py
│   ├── requirements.txt
│   └── .env.example
│
└── mobile/
    ├── src/
    │   ├── components/
    │   │   └── index.tsx
    │   ├── navigation/
    │   │   └── index.tsx
    │   ├── screens/
    │   │   ├── Dashboard/
    │   │   ├── Strategy/
    │   │   ├── Backtest/
    │   │   ├── Logs/
    │   │   ├── Settings/
    │   │   └── PaperTrading/
    │   ├── services/
    │   │   ├── api.ts
    │   │   └── index.ts
    │   ├── store/
    │   │   ├── authStore.ts
    │   │   ├── themeStore.ts
    │   │   └── strategyStore.ts
    │   └── types/
    │       └── index.ts
    ├── App.tsx
    ├── package.json
    └── app.json
```

## 🚀 Como Executar

### Backend

1. **Criar ambiente virtual:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows
```

2. **Instalar dependências:**
```bash
pip install -r requirements.txt
```

3. **Configurar variáveis de ambiente:**
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

4. **Iniciar o servidor:**
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

A API estará disponível em `http://localhost:8000`

### Mobile

1. **Instalar dependências:**
```bash
cd mobile
npm install
```

2. **Iniciar o Expo:**
```bash
npm start
```

3. **Executar no dispositivo:**
- Escaneie o QR code com o app Expo Go
- Ou pressione `a` para Android / `i` para iOS

## 📊 Funcionalidades

### Dashboard
- Gráfico de candlestick em tempo real
- Status do bot (Running/Stopped)
- P/L diário
- Último trade executado
- Controle de início/parada do bot

### Configuração de Estratégia
- Seleção de ativo (PETR4, VALE3, etc.)
- Escolha de timeframe (1M, 5M, 1H, 1D)
- Ajuste de períodos das médias móveis
- Configuração de stop loss e take profit

### Backtesting
- Simulação com dados históricos
- Métricas: Retorno Total, Win Rate, Max Drawdown, Sharpe Ratio
- Gráfico de equity curve
- Visualização de pontos de compra/venda

### Logs
- Histórico de ordens executadas
- Erros de conexão
- Atualizações do sistema
- Filtro por nível (Success, Error, Info, Warning)

### Settings
- Configuração de API Key e Secret
- Teste de conexão
- Toggle Paper Trading
- Toggle Dark Mode
- Reset de saldo simulado

### Paper Trading
- Execução simulada de ordens
- Saldo simulado inicial de R$ 10.000,00
- Histórico de ordens simuladas
- Acompanhamento de posições abertas

## 🔒 Segurança

- API Keys criptografadas no banco de dados
- Autenticação JWT
- Senhas hasheadas com bcrypt
- Validação de dados com Pydantic

## 📈 Indicadores Técnicos Disponíveis

- Médias Móveis Simples (SMA)
- Médias Móveis Exponenciais (EMA)
- RSI (Índice de Força Relativa)
- MACD
- Bandas de Bollinger

## 🎨 Tema

O aplicativo suporta modo claro e escuro, com cores personalizadas:
- **Verde** (#00d4aa) - Compra/Sucesso
- **Vermelho** (#ff6b6b) - Venda/Erro
- **Azul** (#0077ff) - Primary/Destaque

## 📝 Próximos Passos

- [ ] Implementar WebSocket para dados em tempo real
- [ ] Adicionar mais estratégias de trading
- [ ] Implementar notificações push
- [ ] Adicionar autenticação biométrica
- [ ] Integração completa com MetaTrader5
- [ ] Testes automatizados

## 📄 Licença

Este projeto é para fins educacionais. Use por sua conta e risco.

---

**Aviso:** Trading envolve riscos. Este software é fornecido "como está" sem garantias. Sempre teste estratégias em paper trading antes de operar com dinheiro real.
