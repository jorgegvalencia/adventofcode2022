import { fileURLToPath } from 'url'
import fs from 'fs'
import path, { dirname } from 'path'

import * as readline from 'node:readline/promises'

const __dirname = dirname(fileURLToPath(import.meta.url))

main()

const ASCII_LOWER_CASE_START = 97
const ASCII_LOWER_CASE_END = 122

const ASCII_UPPER_CASE_START = 65
const ASCII_UPPER_CASE_END = 90

const PRIORITY_OFFSET = 26

// PRE: A given rucksack always has the same number of items in each of its two compartments
async function main () {
  try {
    const readStream = fs.createReadStream(path.resolve(__dirname, 'input.txt'), { encoding: 'utf8' })
    const fileLinesStream = readline.createInterface({ input: readStream })

    let totalPriorities = 0
    let groupTotalPriorities = 0
    const groups = []
  
    let index = 1
    let groupIndex = 0
    for await (const rucksack of fileLinesStream) {
      const repeatedItemType = findRepeatedItemType(rucksack)
      const priority = mapItemToPriority(repeatedItemType)
      totalPriorities += priority

      if (!groups[groupIndex]) {
        groups[groupIndex] = []
      }
      groups[groupIndex].push(rucksack)

      if (index % 3 === 0) {
        groupIndex++
      }
      index++
    }
    // Part 1
    console.log(`The total priority of the repeated items is ${totalPriorities}`)
    
    for (const group of groups) {
      const commonItemType = findItemTypeOfGroup(group)
      const priority = mapItemToPriority(commonItemType)
      groupTotalPriorities += priority
    }
    
    // Part 2
    console.log(`The total priority of the groups item types is ${groupTotalPriorities}`)
  } catch (err) {
    console.error(err)
  }
}

function findRepeatedItemType (rucksack) {
  const leftCompartment = new Set()
  const rightCompartment = new Set()

  let forwardIndex = 0
  let reverseIndex = rucksack.length - 1
  let repeatedItemType = null

  while (forwardIndex < reverseIndex && !repeatedItemType) {
    const leftCompartmentItem = rucksack[forwardIndex]
    const rightCompartmentItem = rucksack[reverseIndex]
  
    if (leftCompartmentItem === rightCompartmentItem) {
      repeatedItemType = leftCompartmentItem
    } else if (leftCompartment.has(rightCompartmentItem)) {
      repeatedItemType = rightCompartmentItem
    } else if (rightCompartment.has(leftCompartmentItem)) {
      repeatedItemType = leftCompartmentItem
    } else {
      leftCompartment.add(leftCompartmentItem)
      rightCompartment.add(rightCompartmentItem)
    }
  
    forwardIndex++
    reverseIndex--
  }
  return repeatedItemType
}

function findItemTypeOfGroup (group) {
  const [rucksack1, rucksack2, rucksack3] = group
  const fullRucksack = rucksack1.concat(rucksack2, rucksack3)

  const set1 = new Set(rucksack1)
  const set2 = new Set(rucksack2)
  const set3 = new Set(rucksack3)
  const fullSet = new Set(fullRucksack)

  let foundItemType
  for(let item of fullSet.values()) {
    if (set1.has(item) && set2.has(item) && set3.has(item)) {
      foundItemType = item
      break
    }
  }

  return foundItemType
}

function mapItemToPriority (item) {
  const asciiNumber = item.charCodeAt(0)
  let priority = 0
  if (asciiNumber >= ASCII_LOWER_CASE_START && asciiNumber <= ASCII_LOWER_CASE_END) {
    priority = asciiNumber - ASCII_LOWER_CASE_START + 1
  } else if (asciiNumber >= ASCII_UPPER_CASE_START && asciiNumber <= ASCII_UPPER_CASE_END) {
    priority = asciiNumber - ASCII_UPPER_CASE_START + PRIORITY_OFFSET + 1
  }
  return priority
}