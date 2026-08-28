# Laranjinha — site +18 com checkout Pix

Site estático e responsivo preparado para GitHub Pages.

## O que já está pronto

- confirmação obrigatória de maioridade;
- três pacotes com preços definidos;
- checkout com valor correspondente ao pacote;
- geração do Pix Copia e Cola e QR Code;
- botão direto para a conversa no Instagram;
- layout responsivo para celular e computador.

## Ativar o pagamento

Edite somente o início de `config.js` e preencha:

```js
pixName: "NOME DO RECEBEDOR",
pixKey: "CHAVE PIX ALEATÓRIA",
pixCity: "CIDADE",
instagramUsername: "@usuario"
```

Enquanto esses dados estiverem vazios, o checkout permanece em modo de demonstração e não gera uma cobrança.

O site confirma pagamentos manualmente pelo Instagram. Para confirmação automática, seria necessário um provedor Pix com API e webhook em um servidor protegido.

Não coloque senhas, tokens ou credenciais privadas neste repositório.
