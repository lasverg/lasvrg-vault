import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const certsPath = __dirname

export function getPrivateSecret(): string {
  try {
    const privateCert = readFileSync(join(certsPath, 'private.pem'), 'utf8')
    return privateCert
  } catch (error) {
    console.error('Error reading private certificate:', error)
    return ''
  }
}

export function getPublicSecret(): string {
  try {
    const publicCert = readFileSync(join(certsPath, 'public.pem'), 'utf8')
    return publicCert
  } catch (error) {
    console.error('Error reading public certificate:', error)
    return ''
  }
}
