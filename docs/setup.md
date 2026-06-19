# Setup

## Local n8n example

```bash
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

## Environment

Copy the example file locally:

```bash
cp env.example .env
```

Fill placeholders locally only. Do not commit `.env`.

## Importing workflows

1. Open n8n.
2. Import a `workflow.example.json` file.
3. Replace placeholder credentials with local n8n credentials.
4. Test with fake data.
5. Keep workflows inactive until reviewed.
