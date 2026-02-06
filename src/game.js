export class GameState {
    constructor() {
        this.startNumber = 0;
        this.numberToAdd = 0;
        this.targetSum = 0;
        this.currentSum = 0;
        this.jumps = []; // Array of { type: 10 | 1, from: number, to: number }
        this.listeners = [];
    }

    startNewGame() {
        // Random number between 10 and 70
        this.startNumber = Math.floor(Math.random() * 60) + 10;
        // Random number to add between 10 and 29 (for simple 2-digit addition start)
        this.numberToAdd = Math.floor(Math.random() * 20) + 10;

        this.targetSum = this.startNumber + this.numberToAdd;
        this.currentSum = this.startNumber;
        this.jumps = [];
        this.notify();
    }

    addJump(amount) {
        if (this.currentSum + amount > this.targetSum) {
            return false;
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
