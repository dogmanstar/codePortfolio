export { CreateSolutionBoard };

class CreateSolutionBoard {
    constructor() {
        this.cellArr = [];
        this.rowList = {};
        this.colList = {};
        this.blockList = {};
        this.animationStepsArr = [];
        this.initProps();
    }
    
    // Set up CreateSolutinBoard object on init
    initProps() {
        // Init array of Cell objs
        let arr = [];
        for (let i = 0; i < 81; i++) {
            let cell = new Cell(i);
            arr.push(cell);
        }
        this.cellArr = arr;
        // Create lookup lists for row, col, block
        // All lists are zero indexed
        for (let i = 0; i < 81; i++) {
            let row = Math.floor(i / 9);
            if (this.rowList[row]) {
                this.rowList[row].push(i);
            } else {
                this.rowList[row] = [i];
            }
            let col = i % 9;
            if (this.colList[col]) {
                this.colList[col].push(i);
            } else {
                this.colList[col] = [i];
            }
            let block = (3 * Math.floor(Math.floor(i / 9) / 3)) + Math.floor((i % 9) / 3);
            if (this.blockList[block]) {
                this.blockList[block].push(i);
            } else {
                this.blockList[block] = [i];
            }
        }
    }

    // Entry point to create a new solution board
    makeBoard() {
        let index = 0;
        let board = structuredClone(this.cellArr);

        this.setCellRecursive(index, board);

        // Save frames for return (array of FrameObjects)
        let steps = this.animationStepsArr;
        // Reset for next use of makeBoard()
        this.animationStepsArr = [];

        return steps;
    }

    setCellRecursive(incomingIndex, board) {
        let index = incomingIndex;
        // Skip index if already solved 
        while (board[index].num !== undefined) {
            index += 1;
        }
        // Select a number from possible array
        // If no solution remove from possible and select a new number from remaining
        while (board[index].poss.length > 0) {
            // Select a num from poss. remove from poss but don't set num
            let selected = this.selectAndRemove(index, board);
            let boardCopy = structuredClone(board);
            // Set num to selected on boardCopy
            boardCopy[index].num = selected;
            // Remove selected from board[index].poss
            boardCopy = this.removeSelectedFromPoss(index, boardCopy);
            if (boardCopy === undefined) continue;

            // Look for one possible left in poss list of remaining cells
            // if one poss found jump into recursivly looking for one poss left
            // final cell is always found by this functin. Returns "done" when last cell is filled
            let indexOfOne = this.indexOfCellWithOnePoss(boardCopy);
            if (indexOfOne > -1) {
                boardCopy = this.handleOnePossRecursive(indexOfOne, boardCopy);
                if (boardCopy === undefined) continue;
            }
            
            // Recursive call if one poss left is not found
            if (boardCopy !== "done") {
                boardCopy = this.setCellRecursive(index + 1, boardCopy);
                if (boardCopy === undefined) continue;
            }
            return "done";
        }
        return undefined;
    }
    
    // Remove the selected number at board[index] from all cells in related
    // row, col, block.
    // Takes a snapshot of the board state and pushes to this.animationStepsArr for animation
    // Returns undefined if an empty possible list is found (no solution possible)
    removeSelectedFromPoss(index, board) {
        let remove = board[index].num;
        let cellList = this.getConnectedIndices(board[index]);
        for (let i = 0; i < cellList.length; i++) {
            if (board[cellList[i]].num === undefined) {
                let pIndex = board[cellList[i]].poss.indexOf(remove);
                if (pIndex > -1) {
                    board[cellList[i]].poss.splice(pIndex, 1);
                }
            }
        }
        let snap = this.takeSnapShot(index, board);
        this.animationStepsArr.push(snap);
        if (this.hasZeroPoss(board)) return undefined;
        return board;
    }
    
    // When one poss is found, fucntion sets cell at index to the number
    // Removes number from related cells in row, col, block
    // Return board with single poss resolved, or undfined for no solution, or "done"
    handleOnePossRecursive(index, board) {
        let boardCopy = structuredClone(board);
        boardCopy[index].num = board[index].poss[0];
        boardCopy = this.removeSelectedFromPoss(index, boardCopy);
        if (boardCopy === undefined) return undefined;
        if (this.allCellsResolved(boardCopy)) return "done";

        let indexOfOne = this.indexOfCellWithOnePoss(boardCopy);
        if (indexOfOne > -1) {
            boardCopy = this.handleOnePossRecursive(indexOfOne, boardCopy);
            if (boardCopy === undefined) return undefined;
            if (boardCopy === "done") return "done";
        }
        return boardCopy;
    }

    allCellsResolved(board) {
        let allResolved = true;
        board.forEach((cell) => {
            if (cell.num === undefined) allResolved = false;
        });
        return allResolved;
    }

    indexOfCellWithOnePoss(board) {
        for (let i = 0; i < board.length; i++) {
            if (board[i].num === undefined 
                && board[i].poss.length === 1) return i;
        }
        return -1;
    }

    hasZeroPoss(board) {
        let foundZero = false;
        board.forEach((cell) => {
            if (cell.poss.length === 0) foundZero = true;
        });
        return foundZero;
    }

    // Randomly select a number out of the remaining possible list
    selectAndRemove(index, board) {
        let pIndex = Math.floor(randDecimal() * board[index].poss.length);
        let [x] = board[index].poss.splice(pIndex, 1);
        return x;
    }

    // Creates a new FrameObj of board state for animation
    takeSnapShot(index, board) {
        let arr = this.getConnectedIndices(board[index]);
        let frame = new FrameObj(index, board, arr);
        return frame;
    }

    // Helper function for takeSnapShot() makes list of all connected
    // cells in row, col, block. Used for hilighting connected in animation
    getConnectedIndices(cell) {
        let rcb_set = new Set();
        let rbc = [...this.rowList[cell.row]]
            .concat([...this.colList[cell.col]],[...this.blockList[cell.block]]);
        rbc.sort((a,b) => a - b);
        rbc.forEach((num) => {
            rcb_set.add(num);
        });
        rcb_set.delete(cell.index);
        let arr = [...rcb_set];
        return arr;
    }
}

class Cell {
    constructor(index) {
        this.num = undefined;
        this.poss = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        this.index = index;
        this.row = Math.floor(index / 9);
        this.col = index % 9;
        this.block = (Math.floor(this.row / 3) * 3) + Math.floor(this.col / 3);
    }
}

class FrameObj {
    constructor(index, board, rcb_set) {
        this.indexSelected = index;
        this.board = this.formatBoard(board);
        this.rcb_set = rcb_set;
    }

    formatBoard(board) {
        let arr = board.map((cell) => {
            if (cell.num === undefined) {
                let possArr = [...cell.poss];
                return possArr;
            }
            return cell.num;
        });
        return arr;
    }
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