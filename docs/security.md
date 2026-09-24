# Seguridad

## Qué se quita antes de publicar un workflow

Una exportación de n8n contiene mucho más que la lógica. Antes de publicar, cada `workflow.json` pasa por este proceso:

| Campo de la exportación | Riesgo | Tratamiento |
|---|---|---|
| `nodes[].credentials` | Revela nombres e IDs de credenciales | Eliminado. Se documenta qué tipo de credencial necesita cada nodo |
| `nodes[].webhookId` | Identificador interno de la instancia | Eliminado (n8n lo regenera al importar) |
| `staticData` | Historial real: noticias enviadas, estado | Eliminado |
| `shared`, `meta`, `versionId`, `activeVersion` | Proyecto, propietario, versiones | Eliminados. Solo se conservan `name`, `nodes`, `connections` y `settings` |
| `chatId` de Telegram | Identifica mi cuenta personal | Sustituido por `$env.TELEGRAM_CHAT_ID` |
| Dominio de mi servidor y ruta real del webhook | Superficie de ataque | Sustituidos por `n8n.example.com` y una ruta genérica |
| Comentarios con rutas internas del servidor | Información de infraestructura | Reescritos |
| Workflows que llaman a microservicios internos | Expondrían IPs, puertos y endpoints privados | No se publican. Solo se describe su arquitectura ([arquitectura-otros-workflows.md](arquitectura-otros-workflows.md)) |

Después se ejecuta el escáner:

```bash
node scripts/check-secrets.mjs
```

Busca tokens de bots de Telegram, claves de OpenRouter/OpenAI/Anthropic, webhooks de Discord, cabeceras `Bearer` con valor, IPs privadas, correos e IDs numéricos largos. Termina con código 1 si encuentra algo.

## Autenticación del webhook

El traductor recibe peticiones desde internet, así que su webhook es la parte más expuesta.

| | Antes | Ahora |
|---|---|---|
| Autenticación | Ninguna: bastaba con conocer la URL | *Header Auth* con la cabecera `X-Ara-Key` |
| Dónde vive la clave | — | Credencial cifrada de n8n + `chrome.storage.local` de la extensión |
| Qué pasa sin clave | Se ejecutaba el workflow: gasto en el LLM y mensaje por Telegram | **403** antes de ejecutar ningún nodo |

Se comprobó con dos peticiones sin cabecera válida (una sin clave y otra con un valor inventado): las dos devolvieron 403.

**Cómo generar la clave:** 32 bytes aleatorios en hexadecimal (`RandomNumberGenerator` en PowerShell o `crypto.randomBytes(32)` en Node). Se crea como credencial en n8n y se pega una vez en el popup de la extensión. No aparece en el código, en el repositorio ni en los logs.

## Secretos: `$env` frente a credenciales de n8n

Hoy la clave de OpenRouter se lee con `{{$env.OPENROUTER_API_KEY}}` en la cabecera `Authorization` de los nodos HTTP Request. Así no se exporta con el workflow, pero:

- obliga a permitir el acceso a `$env` desde los nodos (`N8N_BLOCK_ENV_ACCESS_IN_NODE=false`), lo que expone **todas** las variables de entorno a cualquier nodo Code;
- la expresión queda visible en la configuración del nodo.

**Mejora pendiente:** pasar la clave a una credencial *Header Auth* (u *OpenRouter*) de n8n y volver a bloquear el acceso a `$env`. El ID del chat de Telegram no es un secreto y puede quedarse como variable.

## Otras decisiones

- **Sin publicación automática.** Los workflows preparan borradores. Publicar en X lo decido y lo hago yo.
- **Contenido externo = dato no confiable.** Los dos generadores de HTML escapan `& < > " '` en todo el texto que viene de los labs, de los feeds o del LLM.
- **Respuestas del LLM validadas.** Se analizan como JSON y se comprueban (número de elementos, URLs de una lista blanca, idioma). Si no cumplen, el workflow falla o usa un plan B, pero no envía resultados sin validar.
- **Permisos mínimos en la extensión:** `activeTab`, `scripting` y `storage`, y `host_permissions` solo para TryHackMe, pwn.college y el dominio de n8n.

## Qué no debe entrar nunca en el repositorio

`.env`, exportaciones de credenciales, `database.sqlite`, copias de seguridad de n8n, logs de ejecución y capturas en las que se vean URLs, IDs o datos de ejecuciones. El `.gitignore` bloquea los casos habituales.
