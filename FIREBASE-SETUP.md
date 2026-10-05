# Configurar o Firebase (uns 10 minutos)

1. Acesse https://console.firebase.google.com e clique em **Criar projeto** (pode desativar o Analytics).
2. **Firestore Database** > Criar banco de dados > modo **produção** > região `southamerica-east1` (São Paulo).
3. **Authentication** > Começar > ative **E-mail/senha** > aba Usuários > **Adicionar usuário** com o SEU e-mail e uma senha forte. Não crie outros usuários.
4. **Configurações do projeto** (engrenagem) > Seus apps > ícone **</>** (Web) > registre o app > copie o `firebaseConfig` e cole em `js/firebase-config.js`.
5. **Firestore > Regras**: cole o texto abaixo (troque o e-mail pelo seu) e publique.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{db}/documents {
    match /recados/{id} {
      allow create: if request.resource.data.keys().hasOnly(['mensagem','humor','criadoEm'])
        && request.resource.data.mensagem is string
        && request.resource.data.mensagem.size() > 0
        && request.resource.data.mensagem.size() <= 500
        && request.resource.data.humor is string
        && request.resource.data.humor.size() <= 8
        && request.resource.data.criadoEm == request.time;
      allow read, delete: if request.auth != null
        && request.auth.token.email == 'SEU_EMAIL@gmail.com';
    }
  }
}
```

6. **Authentication > Configurações > Domínios autorizados**: adicione `seuusuario.github.io`.
7. Suba tudo pro GitHub Pages. Para ler os recados, abra `seu-link/admin.html` e entre com o e-mail e a senha do passo 3.

A chave do `firebaseConfig` pode ficar pública no GitHub: quem protege os dados são as regras do passo 5.
