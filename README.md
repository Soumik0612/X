# ARCEUS XD MINI

WhatsApp bot using `@whiskeysockets/baileys@7.0.0-rc.14`.

## Setup

1. Install Node.js 20+.
2. Copy `.env.example` to `.env`.
3. Set `OWNER_NUMBER` and `PAIRING_NUMBER`.
4. Run:

```bash
npm install
npm start
```

5. Open the terminal and enter the displayed WhatsApp pairing code on the phone.

## Commands

General:
- `.ping`
- `.alive`
- `.menu`
- `.owner`
- `.groupinfo`

Admin:
- `.tagall [message]`
- `.antilink on|off`
- `.welcome on|off`
- `.goodbye on|off`
- `.delete` (reply to a message)
- `.kick @user`
- `.promote @user`
- `.demote @user`

## Security

Never commit `.env` or `auth_info/`. The authentication state can provide access to the WhatsApp account.

## Render

`render.yaml` is included. For reliable production use, use durable storage for authentication/database data rather than depending on an ephemeral filesystem.
