export { bitMaskBoard };


// Set up referance lists for faster calculation
//-------------------------------------------------
// List for each 3 x 3 block of the 9 x 9 grid containing the cells in that block
let blockList = {0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: []};
let rowList = {0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: []};
let colList = {0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: []};
for (let i = 0; i < 81; i++) {
    let block = (3 * Math.floor(Math.floor(i / 9) / 3)) + Math.floor((i % 9) / 3);
    blockList[block].push(i);
    let row = Math.floor(i / 9);
    rowList[row].push(i);
    let col = i % 9;
    colList[col].push(i);
}


// 
let notByVals = {};
let twoPows = {};
let reverseTwoPows = {};

for (let i = 0; i < 9; i++) {
    notByVals[i] = -(2 ** i) -1;
    let product = 2 ** i;
    twoPows[i] = product;
    reverseTwoPows[product] = i;
}
//-------------------------------------------------

function bitMaskBoard() {
    let board = new Array(81);
    board.fill(511);
    let index = 0;
    let filledBoard = calcIndex(index, board);
    for (let i = 0; i < filledBoard.length; i++) {
        if (filledBoard[i] === 0) filledBoard[i] = 9;
    }
    return filledBoard;
}

function calcIndex(incomingIndex, board) {
    let index = incomingIndex;
    while (board[index] !== 0) {
        let possible = findPossible(board[index]);
        let selected = possible[Math.floor(randDecimal() * possible.length)];
        let boardCopy = [...board];
        board[index] = board[index] & notByVals[selected];

        boardCopy[index] = -(selected + 1);
        boardCopy = cleanPosible(index, selected, boardCopy);
        // Copy boardCopy to return arr
        if (boardCopy === undefined) {
            continue;
        }

        if (index === 80) {
            let array = [selected]
            return array;
        }
        let solutionArray = calcIndex(index + 1, boardCopy);
        if (solutionArray !== undefined) {
            solutionArray.push(selected);
            return solutionArray;
        }
    }
    return undefined;
}

function cleanPosible(index, selected, array) {
    let row = Math.floor(index / 9);
    let col = index % 9;
    let block = (3 * Math.floor(row / 3)) + Math.floor(col / 3);
    // Remove from row
    for (let i = row * 9; i < (row + 1) * 9; i++) {
        if (array[i] > 0) {
            array[i] = array[i] & notByVals[selected];
        }
    }
    // Remove from col
    for (let i = col; i < 81; i += 9) {
        if (array[i] > 0) {
            array[i] = array[i] & notByVals[selected];
        }
    }
    // Remove from block
    for (let i = 0; i < 9; i++) {
        let index2 = blockList[block][i];
        if (index2 !== index && index2 > 0) {
            array[index2] = array[index2] & notByVals[selected];
        }
    }
    // Check for zero possible
    if (array.indexOf(0) > -1) {
        return undefined;
    }

    for (let i = 0; i < array.length; i++) {
        if (i < 0) continue;
        if (reverseTwoPows[array[i]] !== undefined) {
            let selected = reverseTwoPows[array[i]];
            array = cleanPosible(i, selected, array);
            break;
        }
    }
    return array;
}

// Returns an array of numbers still available
function findPossible(num) {
    let arrayOfPossible = [];
    for (let i = 0; i < 9; i++) {
        if ((num & twoPows[i]) === twoPows[i]) {
            arrayOfPossible.push(i);
        }
    }
    return arrayOfPossible;
}

// Emulates Math.rand() but gives a better random value.
function randDecimal() {
    let newRandom = new Uint32Array(1);
    self.crypto.getRandomValues(newRandom);
    let num = newRandom[0];
    num = num.toString();
    num = num.slice(-7);
    num = parseInt(num, 10);
    num = num / 10_000_000;
    return num;
}