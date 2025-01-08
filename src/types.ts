export type BuildxTargetMetadata = {
  'buildx.build.ref'?: string
  'buildx.build.provenance'?: Record<string, unknown>
  'containerimage.descriptor': Record<string, unknown>
  'containerimage.digest': string
  'image.name': string
}

export type BuildxMetadata = Record<string, BuildxTargetMetadata>

export type DockerImageManifest = {
  mediaType: string
  size: number
  digest: string
  platform: {
    architecture: string
    os: string
  }
}

export type DockerImageInspection = {
  schemaVersion: number
  mediaType: string
  manifests: DockerImageManifest[]
}
