export { SolverObject9x9 };

import { CellObject } from "./cellObject.js";

class SolverObject9x9 {
    constructor(unSolvedPuzzleArray, blockSize) {
        this.orderedClueArr = structuredClone(unSolvedPuzzleArray);
        this.blockSize = blockSize;
        this.gridSize = this.blockSize ** 2;

        this.puzzle = [];

        this.blockList = [];
        this.rowList = [];
        this.colList = [];

        this.initPuzzle();
        this.drawDivs();
        //this.findSinglePosLeft();
        // this.y = 9
        // this.x = this.scanBlockForInstancesOfNumber(this.y, this.blockList[0]);
        // console.log(`found ${this.x} instances of number: ${this.y}`);
    }

    initPuzzle() {
        this.fillPuzzleWithCells();
        this.setUpLists();
        //console.log(this.puzzle);
        this.insertCluesIntoPuzzle();
    }
    
    fillPuzzleWithCells() {
        for (let i = 0; i < this.orderedClueArr.length; i++) {
            let cell = new CellObject(i, this.blockSize);
            this.puzzle.push(cell);
        }
    }

    setUpLists() {
        for ( let i = 0; i < this.gridSize; i++) {
            let arrBlock = [];
            this.blockList.push(arrBlock);
            let arrRow = [];
            this.rowList.push(arrRow);
            let arrCol = [];
            this.colList.push(arrCol);
        }
        for (let i = 0; i < this.puzzle.length; i++) {
            let cell = this.puzzle[i];
            this.blockList[cell.blockNum].push(cell);
            this.rowList[cell.row].push(cell);
            this.colList[cell.col].push(cell);
        }
    }

    insertCluesIntoPuzzle() {
        for(let i = 0; i < this.orderedClueArr.length; i++) {
            if (this.orderedClueArr[i] === 0) {
                continue;
            }
            let number = this.orderedClueArr[i];
            this.puzzle[i].num = number;
            this.puzzle[i].possible = undefined;
            for (let j = 0; j < this.puzzle.length; j++) {
                if (this.puzzle[j].num === undefined && i !== j) {
                    if (this.puzzle[j].row === this.puzzle[i].row ||
                        this.puzzle[j].col === this.puzzle[i].col ||
                        this.puzzle[j].blockNum === this.puzzle[i].blockNum) {
                            let removeIndex = this.puzzle[j].possible.indexOf(number);
                            if (removeIndex !== -1) {
                                this.puzzle[j].possible.splice(removeIndex, 1);
                            }
                        }
                }
            }
        }
    }

    drawDivs() {
        let board = document.querySelector("#sudokuBoard");
        while (board.firstChild) {
            board.removeChild(board.firstChild);
        }
        for (let i = 0; i < this.puzzle.length; i++) {
            if (this.puzzle[i].num === undefined) {
                let div = document.createElement("div");
                div.className = "unSolved";
                if (i % 3 === 0) {
                    div.classList.add("thickleft");
                }
                if (Math.floor(i/9) % 3 === 0) {
                    div.classList.add("thickTop");
                }
                for (let j = 0; j < 9; j++) {
                    let smDiv = document.createElement("div");
                    smDiv.className = "possible";
                    let num = j+1;
                    if (this.puzzle[i].possible.includes(num)) {
                        smDiv.innerHTML = num.toString();
                    } else {
                        smDiv.innerHTML = "0";
                        smDiv.classList.add("hide");
                    }
                    div.appendChild(smDiv);
                }
                board.appendChild(div);
            } else {
                let div = document.createElement("div");
                div.className = "cell";
                if (i % 3 === 0) {
                    div.classList.add("thickleft");
                }
                if (Math.floor(i/9) % 3 === 0) {
                    div.classList.add("thickTop");
                }
                div.innerHTML = this.puzzle[i].num.toString();
                board.appendChild(div);
            }
        }
    }

    solve() {

    }

    findSinglePosLeftInCell() {
        let cell = undefined;
        for (let i = 0; i < this.puzzle.length; i++) {
            if (this.puzzle[i].possible !== undefined && this.puzzle[i].possible.length === 1) {
                cell = this.puzzle[i];
                break;
            }
        }
        if (cell === undefined) {
            console.log("no singles found");
            this.findSingleInBlock();
        } else {
            console.log(`found a single at: ${cell.indexNum}`);
            let numToSet = cell.possible[0];
            cell.num = numToSet;
            cell.possible = undefined;
            this.cleanRelatedCells(cell);
        }
        //console.log(cell);
        this.drawDivs();
    }

    findSingleInBlock() {
        let cell;
        let numToSet;
        outerLoop: for (let i = 0; i < this.gridSize; i++) {
            let block = this.blockList[i];
            for (let num = 1; num <= 9; num++) {
                let count = this.scanBlockForInstancesOfNumber(num, block);
                if (count === 1) {
                    for (let j = 0; j < block.length; j++) {
                        if (block[j].possible && block[j].possible.includes(num)) {
                            cell = block[j];
                            numToSet = num;
                            break outerLoop;
                        }
                    }
                }
            }
        }
        if (cell === undefined) {
            console.log("no single in block found");
            //console.log(this.blockList);
            return;
        } else {
            console.log(`found a single in blocknumber: ${cell.blockNum}`);
        }
        cell.num = numToSet;
        cell.possible = undefined;
        this.cleanRelatedCells(cell);
    }

    findSingleInRowOrCol() {
        let cell;
        let numToSet;
        outerLoop: for (let k = 0; k < 9; k++) {
            console.log(`Scanning row ${k} for single in row`)
            let row = this.rowList[k];
            for (let num = 1; num <= 9; num++) {
                console.log(`Scanning row ${k} for single in row`)
                let count = [];
                for (let index = 0; index < row.length; index++) {
                    if (row[index].possible && row[index].possible.includes(num)) {
                        count.push(index);
                    }
                }
                if (count.length === 1) {
                    cell = row[count[0]];
                    numToSet = num;
                    console.log(`found only one in row at indexNum: ${cell.indexNum}`);
                    console.log(row);
                    console.log(cell);
                    break outerLoop;
                }
            }
        }
        if (cell === undefined) {
            outerLoop: for (let k = 0; k < 9; k++) {
                console.log(`Scanning col ${k} for single in col`)
                let col = this.colList[k];
                for (let num = 1; num <= 9; num++) {
                    console.log(`Scanning col ${k} for single in col`)
                    let count = [];
                    for (let index = 0; index < col.length; index++) {
                        if (col[index].possible && col[index].possible.includes(num)) {
                            count.push(index);
                        }
                    }
                    if (count.length === 1) {
                        cell = col[count[0]];
                        numToSet = num;
                        console.log(`found only one of the num ${num} in row at indexNum: ${cell.indexNum}`);
                        
                        break outerLoop;
                    }
                }
            }
        }
        if (cell === undefined) {
            console.log("no single in row or col found");
            return;
        } else {
            console.log(`found a single ${numToSet} at cell: ${cell.indexNum}`);
        }
        cell.num = numToSet;
        cell.possible = undefined;
        this.cleanRelatedCells(cell);
        this.drawDivs();
    }

    scanBlockForOnlyTwoInBlock() {
        console.log("In scan for two");
        let removedAtLeastOnePossibility = false;
        outerLoop: for (let i = 0; i < 9; i++) {
            let block = this.blockList[i];
            for (let num = 1; num <= 9; num++) {
                let foundArr = [];
                for (let j = 0; j < 9; j++) {
                    console.log(`Scanning block:${i} for the num: ${num} in possible of index: ${j}`)
                    if (block[j].possible && block[j].possible.includes(num)) {
                        let obj = block[j];
                        foundArr.push(obj);
                    }
                    console.log(foundArr);
                }
                if (foundArr.length === 2 && foundArr[0].row === foundArr[1].row) {
                    console.log(`in remove num: ${num} from row`);
                    let row = this.rowList[foundArr[0].row];
                    console.log(row);
                    let checkremove = this.onlyTwoInBlockRemovePosFromRowOrCol(num, foundArr[0].blockNum, row);
                    if (checkremove === true) {
                        removedAtLeastOnePossibility = true;
                        break outerLoop;
                    }
                }
                if (foundArr.length === 2 && foundArr[0].col === foundArr[1].col) {
                    console.log(`in remove num: ${num} from col`);
                    let col = this.colList[foundArr[0].col];
                    console.log(col);
                    let checkremove = this.onlyTwoInBlockRemovePosFromRowOrCol(num, foundArr[0].blockNum, col);
                    if (checkremove === true) {
                        removedAtLeastOnePossibility = true;
                        break outerLoop;
                    }
                }
            }
        }
        console.log(`Removed at least one = ${removedAtLeastOnePossibility}`);
        this.drawDivs();
    }
    
    onlyTwoInBlockRemovePosFromRowOrCol(numberToRemove, blockNumToExclude, listRowOrCol) {
        let removedPossible = false;
        console.log(`Made it in to remove ${numberToRemove} from list. not in block: ${blockNumToExclude}`);
        for (let i = 0; i < listRowOrCol.length; i++) {
            if (listRowOrCol[i].possible && listRowOrCol[i].blockNum !== blockNumToExclude) {
                let index = listRowOrCol[i].possible.indexOf(numberToRemove);
                if (index > -1) {
                    listRowOrCol[i].possible.splice(index, 1);
                    console.log(`removed ${numberToRemove} from index ${index}`);
                    removedPossible = true;
                }
            }
        }
        return removedPossible;
    }

    scanBlockForInstancesOfNumber(numToLookFor, block) {
        let n = numToLookFor;
        let b = block;
        let count = 0;
        for (let i = 0; i < this.gridSize; i++) {
            if (b[i].possible && b[i].possible.includes(n)) {
                count++;
            }
        }
        return count;
    }

    cleanRelatedCells(cell) {
        for (let i = 0; i < this.gridSize; i++) {
            if (this.blockList[cell.blockNum][i].num === undefined) {
                let indexNum = this.blockList[cell.blockNum][i].possible.indexOf(cell.num);
                if (indexNum !== -1) {
                    this.blockList[cell.blockNum][i].possible.splice(indexNum, 1);
                }
            }
            if (this.rowList[cell.row][i].num === undefined) {
                let indexNum = this.rowList[cell.row][i].possible.indexOf(cell.num);
                if (indexNum !== -1) {
                    this.rowList[cell.row][i].possible.splice(indexNum, 1);
                }
            }
            if (this.colList[cell.col][i].num === undefined) {
                let indexNum = this.colList[cell.col][i].possible.indexOf(cell.num);
                if (indexNum !== -1) {
                    this.colList[cell.col][i].possible.splice(indexNum, 1);
                }
            }
        }
    }

    goOneStep() {
        this.findSinglePosLeftInCell();
    }
}