# notifier-action

> GitHub Action to notify repositories using repository dispatch events via a GitHub App

[![Build Status](https://github.com/gr2m/notifier-action/workflows/Test/badge.svg)](https://github.com/gr2m/notifier-action/actions)

## Setup

In order to use the action, you have to [register a GitHub app](https://github.com/settings/apps/new).

- `GitHub App name`: set to something like `<Your Project> Notifier`
- `Homepage URL`: your repository URL
- `Webhook`: remove the check from `[ ] Active`
- `Repository permissions`: Enable Read & Write access for `Contents`
- `Where can this GitHub App be installed?`: Any account (unless you only want installs for repositories with in your account/organization)

Once you are done, generate & download a private key. In your repository, create to secrets:

1. `APP_ID`: set to your newly registered `App ID`
2. `APP_PRIVATE_KEY`: set to the contents of the downloaded `*.pem` file

## Usage

Notify all installed repositories when a release is published:

```yml
name: Notify
on:
  release:
    types:
      - published

jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - uses: gr2m/notifier-action@v1
        with:
          app_id: ${{ secrets.APP_ID }}
          private_key: ${{ secrets.APP_PRIVATE_KEY }}
          event_type: "my-project release"
          event_payload: ${{ toJson(github.event) }}
```

Notify all installed repositories on a push to the `main` branch with a custom payload:

```yml
name: Notify
on:
  push:
    branches:
      - main

jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - uses: gr2m/notifier-action@v1
        with:
          app_id: ${{ secrets.APP_ID }}
          private_key: ${{ secrets.APP_PRIVATE_KEY }}
          event_type: "my-project update"
          event_payload: '{"ref": "${{ github.ref }}", "sha": "${{ github.sha }}"}'
```

## How it works

The action loads all installations of the GitHub App using the credentials you provided. For each installation, the action creates a [repository dispatch event](https://docs.github.com/en/rest/repos/repos#create-a-repository-dispatch-event) with the `event_type` and `event_payload` you configured.

Repositories that have the GitHub App installed can listen for the event and trigger their own workflows:

```yml
on:
  repository_dispatch:
    types:
      - "my-project release"
```

**Important**: if the workflow that triggers the notifier action was itself triggered by `secrets.GITHUB_TOKEN`, no workflow will be triggered for the dispatch event. To workaround that problem, use a personal access token or a GitHub App token instead. See [Triggering new workflows using a personal access token](https://docs.github.com/en/actions/using-workflows/triggering-a-workflow#triggering-a-workflow-from-a-workflow).

## License

[ISC](LICENSE)
