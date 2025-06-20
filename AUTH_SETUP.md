# Configuração da Verificação de Email - Supabase

Este documento explica como configurar o redirecionamento do link de verificação de email do Supabase para sua aplicação.

## 1. Configuração no Supabase Dashboard

### Passo 1: Acessar o Dashboard
1. Acesse [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto

### Passo 2: Configurar URLs de Redirecionamento
1. Vá para **Authentication** → **URL Configuration**
2. Configure os seguintes campos:

#### Site URL
```
https://seu-dominio.com
```
(Substitua `seu-dominio.com` pelo seu domínio real)

#### Redirect URLs
Adicione as seguintes URLs:
```
https://seu-dominio.com/auth/callback
http://localhost:5173/auth/callback
```

### Passo 3: Configurar Templates de Email (Opcional)
1. Vá para **Authentication** → **Email Templates**
2. Você pode personalizar os templates de email de confirmação
3. O link de confirmação será automaticamente redirecionado para `/auth/callback`

## 2. Como Funciona

### Fluxo de Verificação
1. Usuário se registra na aplicação
2. Supabase envia email de verificação
3. Usuário clica no link no email
4. Link redireciona para `/auth/callback` com parâmetros de verificação
5. A página de callback processa a verificação
6. Usuário é redirecionado para `/profile` após verificação bem-sucedida

### Parâmetros da URL
O link de verificação contém os seguintes parâmetros:
- `token_hash`: Token de verificação
- `type`: Tipo de verificação (geralmente "signup")
- `error`: Erro (se houver)
- `error_description`: Descrição do erro (se houver)

## 3. Desenvolvimento Local

Para desenvolvimento local, certifique-se de que:
1. A URL `http://localhost:5173/auth/callback` está nas Redirect URLs do Supabase
2. Sua aplicação está rodando na porta 5173 (padrão do Vite)

## 4. Produção

Para produção:
1. Configure a URL de produção nas Redirect URLs
2. Certifique-se de que o domínio está configurado corretamente
3. O arquivo `netlify.toml` já está configurado para lidar com as rotas SPA

## 5. Testando

Para testar a funcionalidade:
1. Registre um novo usuário
2. Verifique se o email de confirmação foi enviado
3. Clique no link no email
4. Verifique se você é redirecionado para `/auth/callback`
5. Verifique se a verificação é processada corretamente
6. Verifique se você é redirecionado para a página inicial (`/`)

## 6. Solução de Problemas

### Erro: "Link de verificação inválido ou expirado"
- Verifique se a URL de redirecionamento está configurada corretamente no Supabase
- Verifique se o token não expirou (geralmente válido por 24 horas)

### Erro: "Erro na verificação do email"
- Verifique os logs do console para mais detalhes
- Verifique se o tipo de verificação está correto
- Verifique se o token está sendo passado corretamente

### Usuário não é redirecionado
- Verifique se a rota `/auth/callback` está configurada no React Router
- Verifique se o componente `AuthCallbackPage` está funcionando corretamente

## 7. Arquivos Modificados

Os seguintes arquivos foram criados/modificados:
- `src/pages/AuthCallbackPage.tsx` - Nova página de callback
- `src/contexts/AuthContext.tsx` - Adicionada função `verifyEmail` e `emailRedirectTo`
- `src/App.tsx` - Adicionada rota `/auth/callback`
- `netlify.toml` - Já configurado para rotas SPA 