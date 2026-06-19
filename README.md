# n8n Automation Lab

Public portfolio repository with sanitized n8n workflow examples for automation, APIs, content workflows, and alerting.

This repository is designed to demonstrate automation thinking without exposing private credentials, real production workflows, or sensitive data.

## Goal

Show practical automation patterns using n8n concepts:

- Idea generation workflows.
- Email alert workflows.
- Content pipeline workflows.
- API-first automation.
- Environment-based configuration.
- Safe public workflow examples.

## Repository structure

```text
n8n-automation-lab/
├── README.md
├── assets/
│   └── screenshots/
│       ├── daily-content-pipeline.png
│       ├── gmail-alert-system.png
│       ├── workflow-design-decisions.png
│       └── archive/
├── case-studies/
│   ├── daily-content-pipeline.md
│   ├── gmail-alert-system.md
│   └── workflow-design-decisions.md
├── workflows/
│   ├── idea-generator/
│   │   ├── README.md
│   │   └── workflow.example.json
│   ├── email-alerts/
│   │   ├── README.md
│   │   └── workflow.example.json
│   └── content-pipeline/
│       ├── README.md
│       └── workflow.example.json
├── docs/
│   ├── setup.md
│   ├── security.md
│   └── troubleshooting.md
├── env.example
└── .gitignore
```

## Screenshots

The screenshots in `assets/screenshots/` are real n8n workflow captures reviewed and anonymized for portfolio use. They do not include emails, credentials, tokens, API keys, private webhook URLs, sensitive IDs, or personal/customer data.

- [Daily Content Pipeline](assets/screenshots/daily-content-pipeline.png)
- [Gmail Alert System](assets/screenshots/gmail-alert-system.png)
- [Workflow Design Decisions](assets/screenshots/workflow-design-decisions.png)

Earlier SVG recreations were moved to `assets/screenshots/archive/` and are kept only as backup placeholders.

## Workflows included

### 1. Idea Generator

A scheduled workflow that generates structured ideas from a topic list and stores/sends sanitized outputs.

### 2. Email Alerts

A monitoring-style workflow that receives or checks events and sends email alerts using placeholder SMTP configuration.

### 3. Content Pipeline

A workflow concept for turning an idea into draft content, review status, and publishing preparation without auto-publishing.

## What this project demonstrates

- n8n workflow design.
- Automation documentation.
- API and webhook concepts.
- Safe use of environment variables.
- Separation between examples and production credentials.
- Portfolio-ready explanation of automation value.

## Security policy

This repository must never include:

- Real `.env` files.
- API keys.
- SMTP passwords.
- OAuth tokens.
- n8n credential exports.
- Production `database.sqlite` or `state.db`.
- Full backups.
- Private workflow data.
- Personal logs.

Use `env.example` only.

## Usage concept

1. Import a `workflow.example.json` into a local n8n instance.
2. Replace placeholder credentials with your own local credentials inside n8n.
3. Configure environment variables using `env.example` as a guide.
4. Test with fake data before connecting real services.

## Status

Portfolio lab. Examples are sanitized and intentionally not production-connected.

## License

MIT recommended.


## Real-world use cases

- Daily content pipeline with manual approval before publication.
- Gmail-style alert system for operational or editorial notifications.
- Workflow design patterns for keeping credentials, payloads, and execution state out of public exports.
- API-first automations using placeholder credentials and environment-based configuration.
- Portfolio-safe workflow documentation that shows automation thinking without leaking production data.

See `case-studies/` for anonymized workflow case studies and `assets/screenshots/` for real n8n captures that were reviewed and anonymized for portfolio-safe publication.
