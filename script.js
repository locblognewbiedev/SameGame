class Block {
    constructor(color, marked) {
        this.color = color;
        this.marked = marked;
    }
}

class SameGame {
    constructor(canvasId, blockSize = 20) {
        this.canvas = document.getElementById(canvasId);
        this.context = this.canvas.getContext('2d');
        this.board = [];
        this.blockSize = blockSize;
        this.size = this.canvas.width / this.blockSize;
        this.score = 0;
        this.canvas.onclick = this.handleClick.bind(this);
        this.newGame();
    }

    setUpGame() {
        this.board = [];
        const colors = ['red', 'green', 'blue', 'purple', 'orange'];

        for (let i = 0; i < this.size; i++) {
            this.board.push(new Array(this.size));
        }

        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                const color = colors[Math.floor(Math.random() * colors.length)];
                this.board[row][col] = new Block(color, false);
            }
        }
    }

    drawBoard() {
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                this.context.fillStyle = this.board[row][col].color;
                this.context.fillRect(col * this.blockSize, row * this.blockSize, this.blockSize, this.blockSize);
            }
        }
    }

    checkGameOver() {
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                const color = this.board[row][col].color;
                if (color !== 'black' && (
                    (row > 0 && this.board[row - 1][col].color === color) ||
                    (row < this.size - 1 && this.board[row + 1][col].color === color) ||
                    (col > 0 && this.board[row][col - 1].color === color) ||
                    (col < this.size - 1 && this.board[row][col + 1].color === color)
                )) {
                    return false;
                }
            }
        }

        if (this.board[this.size - 1][0].color === 'black') {
            alert('You win! Final score: ' + this.score);
        } else {
            alert('Game Over. Final Score: ' + this.score);
        }
    }

    findMatchingBlocks(row, col, color) {
        if (this.board[row][col].color === 'black' || this.board[row][col].marked || this.board[row][col].color !== color) {
            return 0;
        }

        this.board[row][col].marked = true;

        let sum = 1;
        if (row > 0) {
            sum += this.findMatchingBlocks(row - 1, col, color);
        }
        if (row < this.size - 1) {
            sum += this.findMatchingBlocks(row + 1, col, color);
        }
        if (col > 0) {
            sum += this.findMatchingBlocks(row, col - 1, color);
        }
        if (col < this.size - 1) {
            sum += this.findMatchingBlocks(row, col + 1, color);
        }

        return sum;
    }

    dropMarkedBlocks() {
        for (let col = 0; col < this.size; col++) {
            for (let row = this.size - 1; row >= 0; row--) {
                if (this.board[row][col].marked) {
                    for (let colrow = row; colrow >= 0; colrow--) {
                        if (colrow > 0) {
                            this.board[colrow][col].color = this.board[colrow - 1][col].color;
                            this.board[colrow][col].marked = this.board[colrow - 1][col].marked;
                        } else {
                            this.board[colrow][col].color = 'black';
                            this.board[colrow][col].marked = false;
                        }
                    }
                    row++;
                }
            }
        }
    }

    shiftClearedRows() {
        for (let col = 0; col < this.size; col++) {
            while (this.board[this.size - 1][col].color === 'black') {
                for (let shiftcol = col; shiftcol < this.size - 1; shiftcol++) {
                    for (let row = 0; row < this.size; row++) {
                        this.board[row][shiftcol].color = this.board[row][shiftcol + 1].color;
                        this.board[row][shiftcol].marked = this.board[row][shiftcol + 1].marked;
                    }
                }

                for (let row = 0; row < this.size; row++) {
                    this.board[row][this.size - 1].color = 'black';
                    this.board[row][this.size - 1].marked = false;
                }

                let allblack = true;
                for (let examcol = this.size - 1; examcol > col; examcol--) {
                    if (this.board[this.size - 1][examcol].color !== 'black') {
                        allblack = false;
                    }
                }

                if (allblack) {
                    break;
                }
            }
        }
    }

    updateScore() {
        document.getElementById('score').innerHTML = 'Score: ' + this.score;
    }

    handleClick(event) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        const col = Math.floor(mouseX / this.blockSize);
        const row = Math.floor(mouseY / this.blockSize);

        console.log('Row:', row, 'Col:', col);
        const blocks = this.findMatchingBlocks(row, col, this.board[row][col].color);
        if (blocks < 2) {
            this.board[row][col].marked = false;
            return;
        }
        this.score += Math.pow(blocks - 1, 2);
        this.dropMarkedBlocks();
        this.shiftClearedRows();
        this.drawBoard();
        this.updateScore();

        this.checkGameOver();
    }

    newGame() {
        this.score = 0;
        this.setUpGame();
        this.drawBoard();
        this.updateScore();
    }
}

class Level {
    constructor() {
        if (Level.instance) {
            return Level.instance;
        }
        this.easyBlockSize = 30;
        this.mediumBlockSize = 20;
        this.hardBlockSize = 10;
        Level.instance = this;
    }
}
const level = new Level();
class LevelFunction {
    static easy = function () {
        const sameGame = new SameGame('canvas', level.easyBlockSize);
    }
    static medium = function () {
        const sameGame = new SameGame('canvas', level.mediumBlockSize);
    }
    static hard = function () {
        const sameGame = new SameGame('canvas', level.hardBlockSize);
    }
}
//khi tải trang sẽ gọi phướng thức tĩnh LevelFunction.easy();
window.onload = () => {
    LevelFunction.easy();
}

