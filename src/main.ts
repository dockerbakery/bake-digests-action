import * as core from '@actions/core'
import type { BuildxMetadata } from './types'
import { dockerManifestInspect } from './dockerManifestInspect'

const BAKE_MEDATA_IMAGE_NAME = 'image.name' as const
const BAKE_MEDATA_IMAGE_DIGEST = 'containerimage.digest' as const

type ActionOutputs = {
  images: string[]
}

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const output: ActionOutputs = {
      images: []
    }
    const bakeTargets: string[] = core.getMultilineInput('bake-targets', {
      required: false,
      trimWhitespace: true
    }) ?? ['default']
    const bakeMetadataOutput: string = core.getInput('bake-metadata-output', {
      required: true
    })
    const recursive: boolean = core.getInput('recursive') === 'true'

    // Remove any empty bake targets
    const filteredBakeTargets = bakeTargets.filter(
      target => target.trim() !== ''
    )

    // Log the bake targets
    core.info(`Bake targets: ${bakeTargets.join(', ')}`)

    // Parse the bake metadata output
    const bakeMetadata: BuildxMetadata = JSON.parse(bakeMetadataOutput)

    // Process the bake metadata
    for (const target in bakeMetadata) {
      if (
        filteredBakeTargets.length > 0 &&
        !filteredBakeTargets.includes(target)
      ) {
        core.info(`Skipping bake target: ${target}`)
        continue
      }

      // Skip buildx metadata
      if (target.startsWith('buildx.')) {
        continue
      }

      // Process the bake target
      await core.group(`Processing bake target: ${target}`, async () => {
        const metadata = bakeMetadata[target]
        const imagename = metadata[BAKE_MEDATA_IMAGE_NAME]
        const imagedigest = metadata[BAKE_MEDATA_IMAGE_DIGEST]

        if (!imagename || !imagedigest) return

        const tags = imagename.split(',').map(tag => tag.trim())
        for (const tag of tags) {
          const image = `${tag}@${imagedigest}`

          core.info(`Adding target "${target}" image to output: ${image}`)
          output.images.push(image)

          // Extract the platform manifest
          if (recursive) {
            const inspect = await dockerManifestInspect(image)

            // Add the platform images to the output
            for (const manifest of inspect.manifests) {
              const manifestDigest = `${imagename}@${manifest.digest}`
              core.info(`Adding "${manifestDigest}" to output`)
              output.images.push(manifestDigest)
            }
          }
        }
      })
    }

    // Print the output
    core.group('Images', async () => {
      for (const image of output.images) {
        core.info(image)
      }
    })

    // Set the output
    core.setOutput('images', output.images)
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
