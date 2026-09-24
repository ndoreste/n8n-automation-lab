# Puesta en marcha

## 1. n8n

Cualquier instancia reciente de n8n sirve. En local, con Docker:

```bash
docker run -it --rm --name n8n -p 5678:5678 \
  -e GENERIC_TIMEZONE=Atlantic/Canary \
  -e N8N_BLOCK_ENV_ACCESS_IN_NODE=false \
  -e OPENROUTER_API_KEY=... \
  -e TELEGRAM_CHAT_ID=... \
  -v n8n_data:/home/node/.n8n \
  docker.n8n.io/n8nio/n8n
```

`N8N_BLOCK_ENV_ACCESS_IN_NODE=false` hace falta porque los workflows leen `$env.OPENROUTER_API_KEY` y `$env.TELEGRAM_CHAT_ID`. En un servidor, estas variables van en el `.env` de Docker Compose, que **nunca** se sube al repositorio.

> El webhook del traductor necesita una URL pública con HTTPS para que la extensión pueda llamarlo. En local basta con `http://localhost:5678`, pero entonces tendrás que cambiar `host_permissions` en la extensión.

## 2. Variables

Ver [`env.example`](../env.example):

| Variable | Uso |
|---|---|
| `OPENROUTER_API_KEY` | Clave de [OpenRouter](https://openrouter.ai/) para las llamadas al LLM |
| `TELEGRAM_CHAT_ID` | ID del chat de Telegram que recibe los informes |

## 3. Credenciales en n8n

Las exportaciones no incluyen ninguna credencial. Hay que crearlas en **Credentials → Add credential** y asignarlas a mano:

| Credencial | Tipo | Nodos |
|---|---|---|
| Bot de Telegram | *Telegram API* (token de [@BotFather](https://t.me/BotFather)) | Todos los nodos Telegram de los dos workflows |
| Clave del webhook | *Header Auth* · Name `X-Ara-Key` | *Recibir room desde extensión* (Cyber Lab Translator) |

## 4. Importar y probar

1. **Workflows → Import from File** → `workflows/<nombre>/workflow.json`.
2. Abre cada nodo marcado en rojo y selecciona su credencial.
3. Ejecuta con **Probar manualmente** (Daily AI Briefing) o con una llamada de prueba al webhook (Translator):
   ```bash
   curl -X POST https://TU-N8N/webhook/cyber-lab-translator \
     -H "Content-Type: application/json" \
     -H "X-Ara-Key: TU_CLAVE" \
     -d '{"title":"Test","url":"https://tryhackme.com/room/test","text":"Use nmap to enumerate open ports on the target machine."}'
   ```
4. Activa el workflow cuando la prueba sea correcta.
