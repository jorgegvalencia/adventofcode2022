import { fileURLToPath } from 'url'
import fs from 'fs'
import os from 'os'
import path, { dirname } from 'path'
import util from 'util'

const __dirname = dirname(fileURLToPath(import.meta.url))

main()

async function main () {
  try {
    const readFile = util.promisify(fs.readFile)
    const fileContent = await readFile(path.resolve(__dirname, 'input.txt'), { encoding: 'utf8' })

    const parsedElvesCalories = fileContent.split(os.EOL).join(',').split(',,')
    const elvesWithFoodCalories = parsedElvesCalories
      .map((calories, index) => {
        return calories
          .split(',')
          .reduce(([elf, totalCalories], foodCalories) => {
            totalCalories += Number(foodCalories)
            return [elf, totalCalories]
          }, [index + 1, 0])
      })
      .sort(([, elfA], [, elfB]) => elfB - elfA)
  
    const elvesSortedByCalories = elvesWithFoodCalories.sort(([, elfA], [, elfB]) => {
      return elfB - elfA
    })

    // Part 1
    console.log(`The elf that carries more calories is the number ${elvesSortedByCalories?.[0][0]}, with ${elvesSortedByCalories?.[0][1]} calories`)

    // Part 2
    const totalCaloriesFromTopThree = elvesSortedByCalories?.[0][1] + elvesSortedByCalories?.[1][1] + elvesSortedByCalories?.[2][1]
    console.log(`The total calories carried by the top 3 elves with most calories is ${totalCaloriesFromTopThree}`)

  } catch (err) {
    console.error(err)
  }
}