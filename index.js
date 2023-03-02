const fs = require('fs');
const readline = require('readline');

// Класс для хранения информации о строке
class Record {
  constructor(text, index, changed) {
    this.text = text;
    this.index = index;
    this.changed = changed;
  }
}

async function readLine(inputFile, currLine, isAsc) {
  try {
    // Получение стрима файла
    const inputFileStream = fs.createReadStream(inputFile);
    // Создание интерфейса для чтения файла
    const rl = readline.createInterface({
      input: inputFileStream,
      crlfDelay: Infinity
    });
    let index = 0;
    let newLine = new Record(currLine.text, currLine.index, false);
    // Получение очередной строки из интерфейса
    for await (const line of rl) {
      // Если новая строка не определена
      if (isAsc) {
        if (line > currLine.text && newLine.changed === false) {
          newLine = new Record(line, index, true);
        }
      } else {
        if (line < currLine.text && newLine.changed === false) {
          newLine = new Record(line, index, true);
        }
      }
      // Если строка та же по содержанию, но другой индекс
      if (currLine.text === line && currLine.index < index) {
        newLine = new Record(line, index, true);
        return newLine;
      }
      // Если новая определена
      if (isAsc) {
        if (currLine.text < line && line < newLine.text) {
          newLine = new Record(line, index, true);
        }
      } else {
        if (currLine.text > line && line > newLine.text) {
          newLine = new Record(line, index, true);
        }
      }
      // Инкрементируем индекс
      index++;
    }
    return newLine;
  } catch (err) {
    console.error(err);
  }
}

async function writeLine(outputFile, record) {
  fs.appendFile(outputFile, record.text + '\n', (err) => {
    if (err) {
      console.error(err);
    }
  })
}

async function sortFile(inputFile, outputFile, order) {
  // Определение порядка сортировки
  let isAsc = (order === 'asc');
  let startCode = isAsc ? 0 : 255;
  // Переменная для хранения минимальной строки, её номера в файле и флага об изменении
  let currLine = new Record(String.fromCharCode(startCode), null, null);
  // Цикл пока были изменённые строки
  do {
    currLine = await readLine(inputFile, currLine, 'desc');
    if (currLine.changed) {
      await writeLine(outputFile, currLine);
      console.log(currLine.text);
    }
  } while (currLine.changed);
}

sortFile('./resourses/big_file.txt', './resourses/result_file.txt', 'asc');