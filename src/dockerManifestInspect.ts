import * as exec from '@actions/exec'
import type { DockerImageInspection } from './types'

/**
 * Perform a `docker manifest inspect` on the provided image.
 * @param image
 * @returns
 */
export async function dockerManifestInspect(
  image: string
): Promise<DockerImageInspection> {
  return new Promise(async (resolve, reject) => {
    let manifestStreamChunk = ''
    try {
      await exec.exec('docker', ['manifest', 'inspect', image], {
        listeners: {
          stdout: (data_1: Buffer) => {
            manifestStreamChunk += data_1.toString()
          }
        },
        failOnStdErr: true
      })
      resolve(JSON.parse(manifestStreamChunk))
    } catch (error) {
      reject(error)
    }
  })
}
