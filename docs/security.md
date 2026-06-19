# Security

## Do not commit

- `.env`
- API keys
- SMTP passwords
- OAuth credentials
- n8n credential exports
- `database.sqlite`
- `state.db`
- Full backups
- Execution logs with private payloads

## Safe workflow sharing

Before sharing a workflow:

1. Remove credentials.
2. Replace real endpoints with examples.
3. Replace personal emails with `example.com` addresses.
4. Set `active` to `false`.
5. Review JSON for secrets.

## Recommended secret scan

```bash
grep -R "password\|token\|secret\|api_key\|Bearer" -n . --exclude-dir=.git
```

Expected public matches should only be placeholders or documentation warnings.
