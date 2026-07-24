# 🧠 BrainMat – Plataforma de Competição de Matemática

**Slogan:** *Treine sua mente. Suba no ranking.*

O **BrainMat** é uma plataforma online moderna, rápida e responsiva de desafios de matemática básica voltada para escolas (Ensino Fundamental e Médio). Com elementos de gamificação, os alunos praticam matemática enquanto competem em um ranking global em tempo real.

---

## 📁 Estrutura Modular do Projeto

```
c:\Users\luana\Documents\Projeto BrainMat\
├── index.html                  # Shell da aplicação web responsiva (SPA)
├── vercel.json                 # Configuração para deploy estático na Vercel
├── css/
│   └── style.css               # Estilos modernos escuros (glassmorphism, degradês vibrantes)
├── js/
│   ├── app.js                  # Ponto de entrada e inicialização global
│   ├── firebase/
│   │   ├── firebase-config.js  # Chaves e inicialização do Firebase v10 SDK
│   │   └── firestore.rules     # Regras de segurança para copiar no Firebase Console
│   ├── auth/
│   │   └── auth-service.js     # Autenticação Google via Popup, logout e monitor de sessão
│   ├── database/
│   │   └── db-service.js       # Transações atômicas de XP e Ranking em tempo real no Firestore
│   ├── profile/
│   │   └── profile-view.js     # Renderização do perfil do aluno (estatísticas, acertos %, streaks)
│   ├── ranking/
│   │   └── ranking-view.js     # Leaderboard global em tempo real com destaque para Top 3
│   ├── audio/
│   │   └── sound-manager.js    # Sintetizador de efeitos sonoros e música ambiente (Web Audio API)
│   ├── game/
│   │   ├── math-engine.js      # Gerador de contas matemática e cálculo de XP dinâmico
│   │   └── game-controller.js  # Loop do jogo, cronômetro e persistência de partidas
│   ├── components/
│   │   ├── header-nav.js       # Barra superior (Avatar, XP, Botões de Controle)
│   │   └── modal-manager.js    # Gerenciador de janelas modais
│   └── utils/
│       └── formatters.js       # Formatadores de XP, números, porcentagens e datas
└── README.md                   # Manual completo de integração
```

---

## 🛠️ Guia Passo a Passo Completo do Firebase ao Deploy

Este guia foi feito pensando em quem nunca utilizou o Firebase antes. Siga cada passo atentamente.

### 1️⃣ Como Criar um Projeto no Firebase
1. Acesse o site oficial do Firebase Console: [console.firebase.google.com](https://console.firebase.google.com).
2. Faça login com a sua conta Google.
3. Clique no botão **Adicionar projeto** (ou **Criar um projeto**).
4. Digite o nome do projeto (exemplo: `brainmat-escolas`).
5. (Opcional) Você pode desativar o Google Analytics se preferir simplificar e clique em **Criar projeto**.
6. Aguarde a criação e clique em **Continuar**.

---

### 2️⃣ Como Ativar o Firebase Authentication e Login com Google
1. No painel do seu projeto no Firebase, no menu lateral esquerdo, clique em **Compilação (Build)** > **Authentication**.
2. Clique no botão **Vamos começar**.
3. Na aba **Provedores de login**, clique sobre a opção **Google**.
4. Mude a chave para **Ativar**.
5. No campo **E-mail de suporte do projeto**, selecione o seu próprio e-mail.
6. Clique em **Salvar**.
7. Na aba **Domínios autorizados** (na mesma tela de Authentication), certifique-se de que `localhost` está listado e adicione posteriormente o seu domínio da Vercel e da Hostinger quando os tiver.

---

### 3️⃣ Como Criar o Banco de Dados Cloud Firestore
1. No menu lateral esquerdo, clique em **Compilação (Build)** > **Firestore Database**.
2. Clique em **Criar banco de dados**.
3. Escolha o local do banco de dados (Recomendado: `southamerica-east1` em São Paulo para respostas mais rápidas no Brasil).
4. Em regras de segurança, selecione **Iniciar no modo de produção** e clique em **Criar**.

---

### 4️⃣ Como Configurar as Security Rules (Regras de Segurança)
1. Dentro do **Firestore Database**, clique na aba **Regras** no topo da tela.
2. Apague o texto existente e cole exatamente este código contido em `js/firebase/firestore.rules`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if true;
      allow create: if request.auth != null && request.auth.uid == userId;
      allow update: if request.auth != null && request.auth.uid == userId;
      allow delete: if false;
    }
  }
}
```

3. Clique no botão **Publicar**. Isso garante que os alunos só possam alterar seus próprios perfis e impede adulterações indevidas.

---

### 5️⃣ Como Gerar e Inserir as Chaves no Projeto BrainMat
1. No menu lateral esquerdo do Firebase Console, clique no ícone de **Engrenagem ⚙️** (Configurações do Projeto) no topo.
2. Role a página até a seção **Seus aplicativos** e clique no ícone **Web `</>`**.
3. Digite o apelido do app: `BrainMat Web` e clique em **Registrar app**.
4. Copie o bloco de código `firebaseConfig`. Ele será parecido com este:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "brainmat-escolas.firebaseapp.com",
  projectId: "brainmat-escolas",
  storageBucket: "brainmat-escolas.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abc123def456"
};
```

5. Abra o arquivo do seu projeto: `js/firebase/firebase-config.js`.
6. Substitua os valores do objeto `firebaseConfig` pelas chaves que você acabou de copiar no console do Firebase.

---

### 6️⃣ Como Publicar Gratuitamente na Vercel
1. Acesse o site da Vercel: [vercel.com](https://vercel.com) e crie uma conta gratuita (pode entrar com GitHub ou e-mail).
2. Instale a ferramenta Vercel CLI via terminal (se desejar) ou simplesmente envie a pasta do seu projeto para um repositório no GitHub.
3. No painel da Vercel, clique em **Add New...** > **Project**.
4. Selecione o seu repositório `BrainMat` e clique em **Deploy**.
5. Em poucos segundos a Vercel gerará o seu link público seguro (ex: `brainmat.vercel.app`).

---

### 7️⃣ Como Conectar seu Domínio da Hostinger
1. Faça login na sua conta na Hostinger: [hpanel.hostinger.com](https://hpanel.hostinger.com).
2. Vá na seção **Domínios**, escolha o seu domínio e clique em **Gerenciar**.
3. No menu lateral, procure por **DNS / Zone Editor**.
4. Agora vá no painel do seu projeto na Vercel > **Project Settings** > **Domains**.
5. Digite o seu domínio (exemplo: `brainmat.com.br`) e clique em **Add**.
6. A Vercel exibirá as entradas de DNS necessárias:
   - **Registro A**: Apontar `@` para o IP `76.76.21.21`.
   - **Registro CNAME**: Apontar `www` para `cname.vercel-dns.com`.
7. Volte ao painel da Hostinger e adicione/edite esses dois registros na Zona DNS.
8. Por fim, copie seu novo domínio (ex: `https://brainmat.com.br`) e vá no **Firebase Console** > **Authentication** > **Domínios autorizados** e clique em **Adicionar domínio** para que o Login do Google funcione perfeitamente no seu domínio próprio!

---

## ⚡ Pronto para Crescer!

A arquitetura do BrainMat foi totalmente projetada para fácil expansão futura (como novos modos de jogo, sistemas de medalhas, moedas e rankings por escola e turma) na propriedade `system` dos documentos de usuário no Cloud Firestore.
