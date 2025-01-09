# Bake image digests action

Generate a list of container image digests from `docker/bake-action` metadata
output.

[![GitHub Super-Linter](https://github.com/actions/typescript-action/actions/workflows/linter.yml/badge.svg)](https://github.com/super-linter/super-linter)
![CI](https://github.com/actions/typescript-action/actions/workflows/ci.yml/badge.svg)
[![Check dist/](https://github.com/actions/typescript-action/actions/workflows/check-dist.yml/badge.svg)](https://github.com/actions/typescript-action/actions/workflows/check-dist.yml)
[![CodeQL](https://github.com/actions/typescript-action/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/actions/typescript-action/actions/workflows/codeql-analysis.yml)
[![Coverage](./badges/coverage.svg)](./badges/coverage.svg)

## Inputs

- `bake-targets`: The list of bake targets to generate digests for.
- `bake-metadata-output`: The metadata output from `docker/bake-action`.
- `extract-platform-manifests`: If set to `true`, the action will extract the
  platform manifests from the metadata output using `docker manifest inspect`
  command.

## Outputs

- `images`: The list of container image digests.

## Example usage

```yaml
name: ci

on:
  push:
    branches:
      - 'master'

jobs:
  bake:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Login to DockerHub
        uses: docker/login-action@v3
        with:
          username: ${{ vars.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Build and push
        uses: docker/bake-action@v5
        id: bake-action
        with:
          push: true

      - name: Get bake image digests
        id: bake-digests
        uses: dockerbakery/bake-digests-action@v1
        with:
          bake-metadata-output: ${{ steps.bake-action.outputs.metadata }}

      - name: Sign image with cosign
        run: |
          cosign sign --yes --key env://COSIGN_PRIVATE_KEY --recursive=true ${{ join(fromJson(steps.bake-digests.outputs.images), ' ') }}
        env:
          COSIGN_PRIVATE_KEY: ${{ secrets.COSIGN_PRIVATE_KEY }}
          COSIGN_PASSWORD: ${{ secrets.COSIGN_PASSWORD }}
```
