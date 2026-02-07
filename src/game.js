export class GameState {
    constructor() {
        this.mode = 'addition'; // 'addition' | 'commutative' | 'subtraction'
        this.startNumber = 0;
        this.numberToAdd = 0;
        this.targetSum = 0;
        this.currentSum = 0;
        this.jumps = []; // Array of { type: 10 | 1 | -10 | -1, from: number, to: number }
        this.listeners = [];

        // Cache for commutative swap
        this.baseA = 0;
        this.baseB = 0;
    }

    setMode(mode) {
        this.mode = mode;
        this.startNewGame();
    }

    startNewGame() {
        // Random number logic based on mode
        if (this.mode === 'subtraction') {
            // Subtraction: Start - Amount = Target
            // e.g. 50 - 20 = 30.
            // Start should be large enough.
            this.startNumber = Math.floor(Math.random() * 50) + 40; // 40 to 90
            this.numberToAdd = Math.floor(Math.random() * 30) + 5;  // Amount to subtract: 5 to 35
            this.targetSum = this.startNumber - this.numberToAdd;
        } else {
            // Addition or Commutative
            // A + B = Target
            // Ensure A and B are different enough to make swapping interesting
            // e.g. A=20, B=45 vs A=45, B=20
            const A = Math.floor(Math.random() * 40) + 10;
            const B = Math.floor(Math.random() * 40) + 10;

            this.baseA = A;
            this.baseB = B;

            this.startNumber = A;
            this.numberToAdd = B;
            this.targetSum = A + B;
        }

        this.currentSum = this.startNumber;
        this.jumps = [];
        this.notify();
    }

    swapCommutative() {
        if (this.mode !== 'commutative') return;

        // Swap startNumber and numberToAdd logic
        // If current start is baseA, switch to baseB
        if (this.startNumber === this.baseA) {
            this.startNumber = this.baseB;
            this.numberToAdd = this.baseA;
        } else {
            this.startNumber = this.baseA;
            this.numberToAdd = this.baseB;
        }

        // Target sum remains same
        this.currentSum = this.startNumber;
        this.jumps = [];
        this.notify();
    }

    addJump(amount) {
        // Check validity based on mode
        if (this.mode === 'subtraction') {
            // Target is smaller than currentSum
            // Check if overshoot
            if (this.currentSum + amount < this.targetSum) {
                return false;
            }
        } else {
            // Addition
            if (this.currentSum + amount > this.targetSum) {
                return false;
            }
        }

        const from = this.currentSum;
        this.currentSum += amount;
        this.jumps.push({ type: amount, from, to: this.currentSum });
        this.notify();
        return true;
    }

    undo() {
        if (this.jumps.length === 0) return;
        const lastJump = this.jumps.pop();
        this.currentSum = lastJump.from;
        this.notify();
    }

    reset() {
        this.currentSum = this.startNumber;
        this.jumps = [];
        this.notify();
    }

    isComplete() {
        return this.currentSum === this.targetSum;
    }

    subscribe(callback) {
        this.listeners.push(callback);
    }

    notify() {
        this.listeners.forEach(cb => cb(this));
    }
}
