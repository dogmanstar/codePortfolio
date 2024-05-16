import { RenderSudokuObj } from "./sudoku/render_board.js";
import { bitMaskBoard } from "./sudoku/bitMaskBoard.js";
import { CreateSolutionBoard } from "./sudoku/create_solution_board.js";
import { Primes } from "./primes/primeFinders.js";
import { userArr } from "./userTable/randUserList.js";
import { TableRender } from "./userTable/tableRender.js";

const solution = new CreateSolutionBoard();
const renObj = new RenderSudokuObj();

const tableRender = new TableRender();
tableRender.storeNewDataArr(userArr);

const sudokuRunButton = document.querySelector('#sudokuRunButton');
sudokuRunButton.addEventListener('click', () => {
    let board = solution.makeBoard();
    renObj.renderStack(board);
});

const sudokuButton = document.querySelector('#button_sudoku');
const tableButton = document.querySelector('#button_table');
const navBar = document.querySelector('#navBar');
navBar.addEventListener('click', handleNavClick)

const navButtons = new Map([
    [sudokuButton,"#sudokuHide"],
    [tableButton,"#dataTableHide"]
]);

function displayOffEccept(show) {
    navButtons.forEach((idStr, button, map) => {
        if (button === show) {
            let div = document.querySelector(idStr);
            div.style.display = "block";
        } else {
            let div = document.querySelector(idStr);
            div.style.display = "none";
        }
    });
}

displayOffEccept(sudokuButton);

function handleNavClick(event) {
    if (event.target.tagName === 'BUTTON') {
        displayOffEccept(event.target);
    }
}