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
    try {
      const res = await exec.getExecOutput(
        'docker',
        ['manifest', 'inspect', image],
        {
          ignoreReturnCode: true,
          silent: true
        }
      )
      if (res.stderr.length > 0 && res.exitCode != 0) {
        reject(new Error(`Failed to inspect image manifest: ${res.stderr}`))
      }
      resolve(JSON.parse(res.stdout.trim()))
    } catch (error) {
      reject(error)
    }
  })
}
