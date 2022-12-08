import { fileURLToPath } from 'url'
import fs from 'fs'
import path, { dirname } from 'path'

import * as readline from 'node:readline/promises'

import Tree from './Tree.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))

const ROOT_DIR = '/'
const PARENT_DIR = '..'
const COMMAND_PROMPT = '$ '
const DIR_MARKER = 'dir'

const COMMAND_LIST = 'ls'
const COMMAND_CHANGE_DIR = 'cd'

const SIZE_THRESHOLD = 100000

const TOTAL_DISK_SPACE = 70000000
const REQUIRED_DISK_SPACE = 30000000

const FILE_TYPES = {
  FILE: 'file',
  DIR: 'dir'
}

main()

async function main () {
  try {
    const readStream = fs.createReadStream(path.resolve(__dirname, 'input.txt'), { encoding: 'utf8' })
    const fileLinesStream = readline.createInterface({ input: readStream })

    let fileSystemTree = new Tree(ROOT_DIR, FILE_TYPES.DIR, 0)

    // track the current directory
    let currentPwdNode = fileSystemTree.root

    let index = 0
    for await (const line of fileLinesStream) {
      index++
      // skip the root access
      if (index === 1) {
        continue
      }

      if (line.startsWith(COMMAND_PROMPT)) {
        const [, command, dirName] = line.split(' ')
        if (command === COMMAND_LIST) continue
        if (command === COMMAND_CHANGE_DIR) {
           if (dirName === PARENT_DIR) { // cd ..
            currentPwdNode = currentPwdNode?.parent || currentPwdNode
          } else { // cd x
            const dirNode = fileSystemTree.find(currentPwdNode.key + dirName)
            if (dirNode) {
              currentPwdNode = dirNode
            } else {
              // if not found, update tree and update reference
              fileSystemTree.insert({
                parentNodeKey: currentPwdNode.key,
                key: currentPwdNode.key + dirName,
                type: FILE_TYPES.DIR,
                name: dirName,
                value: 0
              })
              currentPwdNode = fileSystemTree.find(currentPwdNode.key + dirName)
            }
          }
        }
      } else if (line.startsWith(DIR_MARKER)) {
        const [, dirName] = line.split(' ')
        const dirNode = fileSystemTree.find(currentPwdNode.key + dirName)

        if (!dirNode) {
          fileSystemTree.insert({
            parentNodeKey: currentPwdNode.key,
            key: currentPwdNode.key + dirName,
            type: FILE_TYPES.DIR,
            name: dirName,
            value: 0
          })
        }
      } else {
        // PRE: should be a file
        const [fileSize, fileName] = line.split(' ')
        
        const fileNode = fileSystemTree.find(currentPwdNode.key + fileName)
        if (!fileNode) {
          fileSystemTree.insert({
            parentNodeKey: currentPwdNode.key,
            key: currentPwdNode.key + fileName,
            type: FILE_TYPES.FILE,
            name: fileName,
            value: Number(fileSize)
          })
          // update the value of the current dir
          currentPwdNode.updateTreeNodeValue()
        }
      }
    }

    fs.writeFile(path.resolve(__dirname, 'tree.txt'), fileSystemTree.toString(), () => console.log('File tree.txt written'))

    // Part 1
    const result1 = [...fileSystemTree.postOrderTraversal()]
      .filter(node => node.type === FILE_TYPES.DIR && node.value <= SIZE_THRESHOLD)
      .map(node => node.value)
      .reduce((result, value) => result += value, 0)

    console.log(`The size of the directories lower than ${SIZE_THRESHOLD} is ${result1}`)

    // Part 2
    // remainingSpace should be equal or higher than required disk space
    const remainingSpace = (TOTAL_DISK_SPACE - fileSystemTree.root.value)
    const [result2] = [...fileSystemTree.postOrderTraversal()]
      .filter(node => node.type === FILE_TYPES.DIR && remainingSpace + node.value >= REQUIRED_DISK_SPACE)
      .sort((n1, n2) => n1.value - n2.value)

    console.log(`The size of the directory with the lowest size that can be removed is ${result2.value}`)
  } catch (err) {
    console.error(err)
  }
}