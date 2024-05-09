export { RenderSudokuObj };


class RenderSudokuObj {
    constructor() {
        this.sudokuBoard = document.querySelector("#sudokuBoard");
        this.placeHolder = new Array(81).fill(0);
        this.drawBoardFromIntegers();
    }

    // Draw a sudoku board from a array of ints 0-9. 
    // Zeros represent empty cell.
    drawBoardFromIntegers(incomingArray = this.placeHolder) {
        this.clearSudokuDiv();
        let intArr = incomingArray
        let divArr = this.makeDivArr();
        for (let i = 0; i < divArr.length; i++) {
            divArr[i].classList.add("sb_cell");
            divArr[i].innerText = intArr[i];
            if (intArr[i] === 0) {
                divArr[i].classList.add("sb_hide");
            }
            this.sudokuBoard.appendChild(divArr[i]);
        }
    }

    // Draws board state with delay between each frame.
    // Expect an array of objects from the FrameObj class.
    renderStack(arrayOfFrames) {
        for (let i = 0; i <= arrayOfFrames.length; i++) {
            setTimeout(() => {
                if (i === arrayOfFrames.length) { // Extra iteration to clear red and pink backgroungs
                    let arr = [...this.sudokuBoard.children];
                    arr.forEach((child) => {
                        child.classList.remove("sb_pink");
                        child.classList.remove("sb_red");
                    });
                } else {
                    this.renderFrame(arrayOfFrames[i]);
                }
            }, i * 400);
        }
    }
    
    renderFrame(frameFromStack) {
        let frame = frameFromStack;
        this.clearSudokuDiv();
        let divArr = this.makeDivArr();
        for (let i = 0; i < frame.board.length; i++) {
            if (Array.isArray(frame.board[i]) === true) {
                divArr[i].classList.add("sb_unSolved");
                for (let j = 1; j <= 9; j++) {
                    let smDiv = document.createElement("div");
                    smDiv.className = "sb_possible";
                    if (frame.board[i].includes(j)) {
                        smDiv.innerText = j.toString();
                    } else {
                        smDiv.innerText = "0";
                        smDiv.classList.add("sb_hide");
                    }
                    divArr[i].appendChild(smDiv);
                }
            } else {
                divArr[i].classList.add("sb_cell");
                divArr[i].innerText = frame.board[i].toString();
            }
        }
        divArr[frame.indexSelected].classList.add("sb_red");
        frame.rcb_set.forEach((index) => {
            divArr[index].classList.add("sb_pink");
        });
        divArr.forEach((child) => {
            this.sudokuBoard.appendChild(child);
        });
        
    }

    clearSudokuDiv() {
        while (this.sudokuBoard.firstChild) {
            this.sudokuBoard.removeChild(this.sudokuBoard.firstChild);
        }
    }

    makeDivArr () {
        let arr = [];
        for (let i = 0; i < 81; i++) {
            let div = document.createElement("div");
            if (i % 3 === 0) {
                div.classList.add("sb_thickleft");
            }
            if (Math.floor(i/9) % 3 === 0) {
                div.classList.add("sb_thickTop");
            }
            arr.push(div);
        }
        return arr;
    }
}