# DentCarePro Frontend

Interface web do sistema DentCarePro SaaS - Aplicação React moderna com TypeScript.

## 🚀 Tecnologias

- **React 19** + **TypeScript**
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **shadcn/ui** - Componentes UI
- **tRPC** - Type-safe API client
- **React Query** - Data fetching
- **Recharts** - Gráficos
- **Wouter** - Routing

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com a URL do backend
```

## 🔧 Configuração

### Variáveis de Ambiente

```env
VITE_API_URL=https://seu-backend.onrender.com
```

**Importante:** Após fazer o deploy do backend no Render, copie a URL gerada e cole aqui.

## 🏃 Executar

### Desenvolvimento

```bash
npm run dev
```

Acesse: `http://localhost:5173`

### Build para Produção

```bash
npm run build
```

## 🌐 Deploy no Vercel (via Manus)

O deploy será feito automaticamente pelo assistente Manus. Você só precisa:

1. Ter a URL do backend pronta
2. Confirmar o deploy

## 📱 Funcionalidades

### ✅ Implementadas

- 🏥 Dashboard com métricas
- 👥 Gestão de Utentes
- 🦷 Gestão de Dentistas
- 📅 Agenda de Consultas
- 💰 Faturação
- 📊 Relatórios e Gráficos
- ⭐ Sistema de Avaliações
- 💵 Gestão de Custos
- 🔔 Notificações
- 🌍 Internacionalização (PT/EN)

### 🎨 Design

- Interface moderna e responsiva
- Dark mode
- Animações suaves
- Componentes reutilizáveis

## 📝 Estrutura

```
frontend/
├── src/
│   ├── components/     # Componentes UI
│   ├── pages/          # Páginas da aplicação
│   ├── hooks/          # Custom hooks
│   ├── lib/            # Utilitários
│   ├── contexts/       # Context providers
│   └── i18n/           # Traduções
├── public/             # Assets estáticos
└── package.json
```

## 🔒 Segurança

- ✅ Variáveis de ambiente protegidas
- ✅ Autenticação com sessões
- ✅ Type-safe API calls
- ✅ Validação de formulários

## 🐛 Troubleshooting

### Erro de Conexão com Backend

- Verifique se o `VITE_API_URL` está correto
- Certifique-se que o backend está rodando
- Verifique o CORS no backend

### Erro no Build

- Limpe o cache: `rm -rf node_modules dist && npm install`
- Verifique se todas as dependências estão instaladas
- Teste localmente com `npm run build && npm run preview`

## 📞 Suporte

Para problemas ou dúvidas, abra uma issue no repositório.
