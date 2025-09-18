# Desenho da Arquitetura - MentorX Connect Hub

## 📐 Diagrama da Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                            🌐 MENTORX CONNECT HUB                                    │
│                              Plataforma de Mentoria                                  │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                           │
                                           ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                📱 FRONTEND LAYER                                     │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐                │
│  │   💻 CLIENT     │    │  📄 STATIC      │    │  🎨 UI/UX       │                │
│  │                 │    │   ASSETS        │    │  COMPONENTS     │                │
│  │  • React App    │    │  • Images       │    │  • Radix UI     │                │
│  │  • Vite Build   │    │  • CSS/JS       │    │  • Tailwind     │                │
│  │  • TypeScript   │    │  • Fonts        │    │  • Framer       │                │
│  │  • React Query  │    │  • Icons        │    │  • Lucide       │                │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘                │
└─────────────────┬───────────────────────────────────────────────────────────────────┘
                  │
                  │ HTTPS API Calls
                  ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                            🚀 VERCEL SERVERLESS LAYER                               │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐                │
│  │  🔧 API CORE    │    │  🛡️ MIDDLEWARE  │    │  📊 HEALTH      │                │
│  │                 │    │                 │    │   MONITORING    │                │
│  │  • index.js     │◄──┤  • CORS Setup   │    │                 │                │
│  │  • Express      │    │  • Security     │    │  • health.js    │                │
│  │  • Route Handler│    │  • Headers      │    │  • Status Check │                │
│  │  • Body Parser  │    │  • Auth Check   │    │  • Uptime Mon   │                │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘                │
└─────────────────────────┬───────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                          💼 BUSINESS SERVICES LAYER                                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐                │
│  │  💳 STRIPE      │    │  📧 EMAIL       │    │  🎥 JITSI       │                │
│  │   SERVICES      │    │   SERVICES      │    │   SERVICES      │                │
│  │                 │    │                 │    │                 │                │
│  │  • Checkout     │    │  • Brevo API    │    │  • Video Calls  │                │
│  │  • Client Mgmt  │    │  • Templates    │    │  • Meeting Mgmt │                │
│  │  • Products     │    │  • Notifications│    │  • Room Control │                │
│  │  • Documents    │    │  • Welcome Msgs │    │  • Integration  │                │
│  │  • Verify Bal   │    │  • Schedules    │    │                 │                │
│  │  • Payouts      │    │                 │    │                 │                │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘                │
└─────┬─────────────────────┬───────────────────────────┬───────────────────────────────┘
      │                     │                           │
      ▼                     ▼                           ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           🗄️ DATA & STORAGE LAYER                                   │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐                │
│  │  🐘 DATABASE    │    │  📁 FILE        │    │  🔧 CONFIG      │                │
│  │                 │    │   STORAGE       │    │   MANAGEMENT    │                │
│  │  • Neon DB      │    │                 │    │                 │                │
│  │  • PostgreSQL   │    │  • Vercel Blob  │    │  • Environment  │                │
│  │  • Serverless   │    │  • Static Files │    │  • Variables    │                │
│  │  • Connection   │    │  • User Uploads │    │  • API Keys     │                │
│  │    Pool         │    │  • Documents    │    │  • Secrets      │                │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘                │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                           │
                                           ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                         🔗 EXTERNAL INTEGRATIONS                                    │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐                │
│  │  💳 STRIPE      │    │  📧 BREVO       │    │  🎯 GOOGLE      │                │
│  │    PLATFORM     │    │   (SendinBlue)  │    │    SERVICES     │                │
│  │                 │    │                 │    │                 │                │
│  │  • Payment API  │    │  • Email API    │    │  • Analytics    │                │
│  │  • Connect API  │    │  • SMTP Service │    │  • Calendar API │                │
│  │  • Webhooks     │    │  • Templates    │    │  • Auth (OAuth)│                │
│  │  • Marketplace  │    │  • Marketing    │    │  • Maps API     │                │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘                │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🏗️ Detalhamento dos Módulos

### 📱 **Frontend Layer (Client)**
**Localização**: `client/src/`

**Componentes Principais**:
- **React Application**: SPA moderna com TypeScript
- **UI Components**: Sistema de design com Radix UI + Tailwind
- **State Management**: React Query para server state
- **Routing**: React Router para navegação
- **Build System**: Vite para desenvolvimento e build otimizado

**Responsabilidades**:
- Interface do usuário para mentores e mentorados
- Formulários e validações client-side
- Gerenciamento de estado da aplicação
- Comunicação com APIs via HTTP

---

### 🚀 **Serverless API Layer (Vercel Functions)**
**Localização**: `api/`

**Componentes Principais**:
- **index.js**: Handler principal das APIs
- **server.js**: Express adapter para serverless
- **health.js**: Endpoint de monitoramento
- **environment.js**: Configurações centralizadas

**Responsabilidades**:
- Processamento de requisições HTTP
- Aplicação de middlewares (CORS, segurança)
- Roteamento de requests para serviços
- Validação e transformação de dados

---

### 💼 **Business Services Layer**
**Localização**: `api/services/`

#### 💳 **Stripe Services Module**
- `stripeServerCheckoutService.js`: Processamento de pagamentos
- `stripeServerClientService.js`: Gestão de contas conectadas
- `stripeServerProductService.js`: Catálogo de produtos/serviços
- `stripeServerDocumentService.js`: Upload de documentos KYC

#### 📧 **Email Services Module** (Migrado)
- Integração com Brevo (ex-SendinBlue)
- Templates personalizados para mentores/mentorados
- Notificações de agendamentos
- E-mails de boas-vindas

#### 🎥 **Jitsi Meet Services** (Migrado)
- Criação e gerenciamento de salas de videoconferência
- Integração com calendários
- Controle de acesso às reuniões

---

### 🗄️ **Data & Storage Layer**

#### 🐘 **Database (Neon PostgreSQL)**
- **Tipo**: PostgreSQL serverless
- **Conexão**: Pool de conexões otimizado para serverless
- **Schemas**: Definidos em `shared/schema.ts`
- **Migrações**: Gerenciadas em `migrations/`

#### 📁 **File Storage**
- **Estáticos**: Servidos via Vercel CDN
- **User Uploads**: Integração com Vercel Blob Storage
- **Documents**: Armazenamento seguro para KYC

#### 🔧 **Configuration Management**
- **Environment Variables**: Gerenciadas via Vercel Dashboard
- **Secrets**: API keys e tokens seguros
- **Feature Flags**: Configurações por ambiente

---

### 🔗 **External Integrations**

#### 💳 **Stripe Platform**
- **Payment Processing**: Cobrança de mensalidades
- **Connect Platform**: Marketplace para mentores
- **Webhooks**: Sincronização de eventos
- **KYC/Onboarding**: Verificação de identidade

#### 📧 **Brevo (SendinBlue)**
- **Transactional Emails**: Notificações automáticas
- **Marketing Campaigns**: E-mail marketing
- **Templates**: Templates personalizados
- **Analytics**: Métricas de engajamento

#### 🎯 **Google Services**
- **Google Calendar**: Integração de agendamentos
- **Google Analytics**: Tracking de usuários
- **Google Auth**: Autenticação social
- **Google Maps**: Localização (se aplicável)

---

## 🔄 Fluxo de Dados

### 📤 **Request Flow (Frontend → Backend)**
```
User Action → React Component → API Call → Vercel Function → Business Service → Database/External API
```

### 📥 **Response Flow (Backend → Frontend)**
```
Database Response → Business Service → Vercel Function → API Response → React Query → Component Update
```

### 🔔 **Event Flow (Webhooks)**
```
External Service → Vercel Webhook → Business Logic → Database Update → Frontend Notification
```

---

## 🛡️ Segurança e Performance

### 🔐 **Segurança**
- HTTPS obrigatório em todas as comunicações
- Headers de segurança (CSP, HSTS, etc.)
- Validação de input com Zod schemas
- Rate limiting nos endpoints críticos
- Isolamento entre execuções serverless

### ⚡ **Performance**
- CDN global para assets estáticos
- Edge functions para baixa latência
- Connection pooling para database
- Cache estratégico em múltiplas camadas
- Otimizações de bundle (code splitting)

---

## 📊 Monitoramento e Observabilidade

### 📈 **Métricas**
- Performance de APIs (latência, throughput)
- Cold starts das functions
- Uso de recursos (CPU, memória)
- Error rates e success rates

### 🚨 **Alertas**
- Falhas críticas de pagamento
- Downtime dos serviços essenciais
- Limites de rate limiting atingidos
- Erros de integração com serviços externos

### 📋 **Logs**
- Request/response logs estruturados
- Business logic events
- Error tracking com stack traces
- Performance profiling

---

## 🎯 Vantagens desta Arquitetura

### ✅ **Escalabilidade**
- Auto-scaling baseado em demanda
- Zero configuração para crescimento
- Distribuição global automática

### ✅ **Confiabilidade**
- Redundância automática
- Isolamento de falhas
- Recovery automático

### ✅ **Produtividade**
- Deploy contínuo automatizado
- Zero gerenciamento de infraestrutura
- Desenvolvimento focado no negócio

### ✅ **Custo-Efetividade**
- Pay-per-use model
- Sem custos de infraestrutura ociosa
- Otimização automática de recursos

Esta arquitetura posiciona o MentorX Connect Hub para crescimento sustentável com excelente experiência tanto para desenvolvedores quanto para usuários finais.