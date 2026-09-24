const WEBHOOK_URL = 'https://n8n.example.com/webhook/cyber-lab-translator';
const MAX_TEXT_CHARS = 30000;

const API_KEY_HEADER = 'X-Ara-Key';

const statusEl = document.getElementById('status');
const btn = document.getElementById('send');
const keyInput = document.getElementById('apiKey');
const keyBox = document.getElementById('keyBox');

function setStatus(msg) { statusEl.textContent = msg; }

// La clave vive solo en chrome.storage.local de este navegador, nunca en el código.
async function getApiKey() {
  const { araApiKey } = await chrome.storage.local.get('araApiKey');
  return araApiKey || '';
}

document.getElementById('saveKey').addEventListener('click', async () => {
  const value = keyInput.value.trim();
  if (value.length < 16) { setStatus('La clave debe tener al menos 16 caracteres.'); return; }
  await chrome.storage.local.set({ araApiKey: value });
  keyInput.value = '';
  keyBox.open = false;
  setStatus('Clave guardada en este navegador.');
});

getApiKey().then((key) => { if (!key) keyBox.open = true; });

function cleanWebhookError(status, body) {
  const text = String(body || '').trim();
  if (status === 401 || status === 403) {
    return `Webhook ${status}: clave rechazada. Revisa la clave guardada en "Clave del webhook".`;
  }
  if (status === 404) {
    return 'Webhook 404: el workflow de n8n no está activo o la ruta del webhook no coincide.';
  }
  if (status >= 500 && /Internal Server Error/i.test(text)) {
    return 'Webhook 500: n8n falló por dentro. Prueba seleccionando solo una tarea; si sigue pasando, hay que revisar el workflow.';
  }
  return `Webhook ${status}: ${text.slice(0, 500)}`;
}

btn.addEventListener('click', async () => {
  btn.disabled = true;
  setStatus('Leyendo texto del lab...');
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) throw new Error('No encuentro la pestaña activa.');

    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (maxChars) => {
        const clean = (value) => String(value || '')
          .replace(/\r/g, '')
          .replace(/[ \t]+\n/g, '\n')
          .replace(/\n{4,}/g, '\n\n\n')
          .trim();

        const selection = clean(window.getSelection ? String(window.getSelection()) : '');
        const selectors = [
          '[data-testid*="task"]', '[class*="task"]',
          'main', '[role="main"]', 'article',
          '[class*="room"]', '[class*="content"]'
        ];

        let rootText = '';
        for (const sel of selectors) {
          const el = document.querySelector(sel);
          const candidate = clean(el?.innerText || '');
          if (candidate.length > rootText.length) rootText = candidate;
          if (candidate.length >= 200 && candidate.length <= maxChars) break;
        }
        if (!rootText) rootText = clean(document.body?.innerText || '');

        const source = selection.length >= 20 ? selection : rootText;
        const clipped = source.length > maxChars;
        const text = clipped ? source.slice(0, maxChars) : source;

        return {
          url: location.href,
          title: document.title || location.href,
          selection,
          text,
          mode: selection.length >= 20 ? 'selection' : 'page',
          clipped,
          originalChars: source.length,
          lang: document.documentElement.lang || '',
          capturedAt: new Date().toISOString()
        };
      },
      args: [MAX_TEXT_CHARS]
    });

    if (!result?.text || result.text.length < 30) {
      throw new Error('No he podido capturar texto suficiente. Selecciona el enunciado de la tarea/challenge o recarga la página y vuelve a pulsar.');
    }

    const advice = result.mode === 'selection'
      ? 'Modo: selección manual.'
      : 'Modo: página. Para evitar errores, si solo quieres una tarea/challenge selecciona su texto primero.';
    const clipped = result.clipped ? '\nAviso: texto recortado para evitar fallo por tamaño.' : '';
    setStatus(`Enviando a n8n/Ara...\n${advice}\nCaracteres enviados: ${result.text.length}/${result.originalChars}${clipped}`);

    const apiKey = await getApiKey();
    if (!apiKey) throw new Error('Falta la clave del webhook. Ábrela en "Clave del webhook" y guárdala.');

    const res = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', [API_KEY_HEADER]: apiKey },
      body: JSON.stringify(result)
    });

    const body = await res.text();
    if (!res.ok) throw new Error(cleanWebhookError(res.status, body));
    setStatus('OK. Ara te enviará el HTML traducido por Telegram.');
  } catch (err) {
    setStatus('Error: ' + (err?.message || String(err)));
  } finally {
    btn.disabled = false;
  }
});
