import { fileURLToPath } from 'url'
import fs from 'fs'
import path, { dirname } from 'path'
import util from 'util'

const __dirname = dirname(fileURLToPath(import.meta.url))

const SIGNAL_MARKER_CHARS = 4
const MSG_MARKER_CHARS = 14

main()

async function main () {
  try {
    const readFile = util.promisify(fs.readFile)
    const dataStreamBuffer = await readFile(path.resolve(__dirname, 'input.txt'), { encoding: 'utf8' })

    // Part 1
    let counter = 0
    const marker = []
    for (const char of dataStreamBuffer) {
      marker.push(char)
      counter++

      if (marker.length === SIGNAL_MARKER_CHARS) {
        if (new Set(marker).size === SIGNAL_MARKER_CHARS) break
        marker.shift()
      }
    }
    console.log(`${counter}`)

    // Part 2
    let msgCounter = 0
    const msgMarker = []
    for (const char of dataStreamBuffer) {
      msgMarker.push(char)
      msgCounter++

      if (msgMarker.length === MSG_MARKER_CHARS) {
        if (new Set(msgMarker).size === MSG_MARKER_CHARS) break
        msgMarker.shift()
      }
    }

    console.log(`${msgCounter}`)
  } catch (err) {
    console.error(err)
  }
}