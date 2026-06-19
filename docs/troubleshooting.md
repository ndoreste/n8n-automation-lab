# Troubleshooting

## Workflow import fails

- Check that the JSON is valid.
- Confirm node types exist in your n8n version.
- Import one workflow at a time.

## Credentials missing

This is expected. Public examples do not include credentials.

Create credentials manually inside your local n8n instance.

## Webhook does not trigger

- Confirm the workflow is active.
- Use the test webhook URL while editing.
- Check HTTP method and path.

## Email does not send

- Verify SMTP credentials locally.
- Check provider app-password requirements.
- Test with a safe recipient first.
