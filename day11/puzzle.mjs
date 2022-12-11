import { fileURLToPath } from 'url'
import fs from 'fs'
import path, { dirname } from 'path'

import * as readline from 'node:readline/promises'

const __dirname = dirname(fileURLToPath(import.meta.url))

const ROUNDS_1 = 20
const ROUNDS_2 = 10000
const MONKEY_BOREDOM = 3

const MONKEY_MARK = 'Monkey'
const ITEMS_MARK = '  Starting'
const OPERATION_MARK = '  Operation'
const TEST_MARK = '  Test'
const TEST_RESULT_T_MARK = '    If true'
const TEST_RESULT_F_MARK = '    If false'

let lcm = 1

main()

/* 
Monkey 0:
  Starting items: 79, 98
  Operation: new = old * 19 // Impact of the inspection of the item worry level
  Test: divisible by 23 // How the monkey uses the worry level
    If true: throw to monkey 2
    If false: throw to monkey 3
*/

class Monkey {
  constructor (props) {
    const {
      number,
      holdedItems,
      inspectionProcess,
      inspectionTest,
      inspectionTestTrueTarget,
      inspectionTestFalseTarget,
    } = props

    this.number = number
    this.holdedItems = holdedItems
    this.inspectionProcess = inspectionProcess
    this.inspectionTest = inspectionTest
    this.inspectionTestTrueTarget = inspectionTestTrueTarget
    this.inspectionTestFalseTarget = inspectionTestFalseTarget

    this.inspectedItems = []
  }

  receiveItems (items = []) {
    this.holdedItems.push(...items)
  }

  throwItem (item, newItemWorryLevel, monkeyTarget) {
    this.holdedItems.splice(this.holdedItems.findIndex(holdedItem => holdedItem === item), 1)
    monkeyTarget?.receiveItems([newItemWorryLevel])
  }

  get inspections () {
    return this.inspectedItems.length
  }

  // resolves the turn
  inspectHoldedItems (monkeyFriends, monkeyBoredom) {
    // console.log(`Monkey ${this.number}`)
    const holdedItems = [...this.holdedItems]

    holdedItems.forEach(item => {
      // console.log(`\tMonkey inspects an item with a worry level of ${item}`)
      const [n1, operator, n2] = this.inspectionProcess

      let inspectionItemWorryLevel
      if (operator=== '*') {
        inspectionItemWorryLevel = 
          Number(n1.replace(new RegExp(/old/, 'g'), item)) * Number(n2.replace(new RegExp(/old/, 'g'), item))
      } else if (operator=== '+') {
        inspectionItemWorryLevel = 
          Number(n1.replace(new RegExp(/old/, 'g'), item)) + Number(n2.replace(new RegExp(/old/, 'g'), item))
      }
      // console.log(`\t\tItem is inspected and the new worry level is ${inspectionItemWorryLevel}`)
  
      const WORRY_LEVEL_HANDLE_1 = (worry) => {
        const newWorry = Math.floor(worry / MONKEY_BOREDOM)
        // console.log(`\t\tMonkey gets bored with item. Worry level is divided by ${MONKEY_BOREDOM} to ${newWorry}.`)
        return newWorry
      }
  
      const WORRY_LEVEL_HANDLE_2 = (worry) => {
        // The new value of worrisome should be somewhat "equivalent" at the moment of the test AND for the target monkey
        return worry % lcm
      }

      const newItemWorryLevel = monkeyBoredom
        ? WORRY_LEVEL_HANDLE_1(inspectionItemWorryLevel)
        : WORRY_LEVEL_HANDLE_2(inspectionItemWorryLevel)

      const inspectionTestResult = newItemWorryLevel % this.inspectionTest === 0
      // console.log(`\t\tCurrent worry level is ${inspectionTestResult && 'not ' || ''}divisible by ${this.inspectionTest}.`)

      const targetMonkey = inspectionTestResult
        ? this.inspectionTestTrueTarget
        : this.inspectionTestFalseTarget

      // console.log(`\t\tItem with worry level ${newItemWorryLevel} is thrown to monkey ${targetMonkey}`)
      this.inspectedItems.push(newItemWorryLevel)

      this.throwItem(item, newItemWorryLevel, monkeyFriends[targetMonkey])
    })
  }
}

async function main () {
  try {
    const readStream = fs.createReadStream(path.resolve(__dirname, 'input.txt'), { encoding: 'utf8' })
    const fileLinesStream = readline.createInterface({ input: readStream })

    const monkeys = []
    const monkeys2 = []
    let context, context2

    for await (const line of fileLinesStream) {
      if (!line.length) {
        continue
      }
  
      if (line.startsWith(MONKEY_MARK)) {
        context = {}
        context2 = {}
        continue
      } else if (line.startsWith(ITEMS_MARK)) {
        context.holdedItems = parseItems(line)
        context2.holdedItems = parseItems(line)
      } else if (line.startsWith(OPERATION_MARK)) {
        context.inspectionProcess = parseOperation(line)
        context2.inspectionProcess = parseOperation(line)
      } else if (line.startsWith(TEST_MARK)) {
        context.inspectionTest = parseTest(line)
        context2.inspectionTest = parseTest(line)
      } else if (line.startsWith(TEST_RESULT_T_MARK)) {
        context.inspectionTestTrueTarget = parseTestResult(line)
        context2.inspectionTestTrueTarget = parseTestResult(line)
      } else if (line.startsWith(TEST_RESULT_F_MARK)) {
        context.inspectionTestFalseTarget = parseTestResult(line)
        context2.inspectionTestFalseTarget = parseTestResult(line)
        monkeys.push(new Monkey({ number: monkeys.length, ...context }))
        monkeys2.push(new Monkey({ number: monkeys.length, ...context2 }))
      }
    }

    for (let round = 1; round <= ROUNDS_1; round++) {
      for (const monkey of monkeys) {
        monkey.inspectHoldedItems(monkeys, true)
      }
    }

    console.log(monkeys.map(m => m.inspections))

    const [firstA, secondA] = monkeys.sort((monkeyA, monkeyB) => monkeyB.inspections - monkeyA.inspections)
    const result1 = firstA.inspections * secondA.inspections
    
    console.log(`The level of monkey business after ${ROUNDS_1} rounds of stuff-slinging simian shenanigans is ${result1}`)

    // Part 2
    // since all dividers for all monkeys are prime numbers, we know the lcm are the product of all dividers
    lcm = monkeys2
      .map((m) => m.inspectionTest)
      .reduce((a, b) => a * b, 1)

    for (let round = 1; round <= ROUNDS_2; round++) {
      for (const monkey of monkeys2) {
        monkey.inspectHoldedItems(monkeys2, false)
      }
    }

    console.log(monkeys2.map(m => m.inspections))
  
    const [firstB, secondB] = monkeys2.sort((monkeyA, monkeyB) => monkeyB.inspections - monkeyA.inspections)
    const result2 = firstB.inspections * secondB.inspections

    console.log(`The level of monkey business after ${ROUNDS_2} rounds of stuff-slinging simian shenanigans is ${result2}`)
  } catch (err) {
    console.error(err)
  }
}

function parseItems (line) {
  const [, items] = line.split(': ')
  return [...items?.split(', ').map(item => Number(item))]
}

function parseOperation (line) {
  // new = old * 19
  const [, operation] = line.split('= ')
  const [n1, operator, n2] = operation.split(' ')
  return [n1, operator, n2]
}

function parseTest (line) {
  const [, divisibleBy] = line.split('Test: divisible by')
  return Number(divisibleBy.trim())
}

function parseTestResult (line) {
  const [, monkeyNumber] = line.split('throw to monkey')
  return Number(monkeyNumber.trim())
}