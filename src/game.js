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

        // Auto-grouping check
        this.checkAutoGroup(amount);

        this.notify();
        return true;
    }

    checkAutoGroup(lastAmount) {
        // Only group 1s
        if (Math.abs(lastAmount) !== 1) return;

        // Check if we have at least 10 jumps
        if (this.jumps.length < 10) return;

        // Get last 10 jumps
        const last10 = this.jumps.slice(-10);

        // Check if all are the same amount (1 or -1)
        const allSame = last10.every(j => j.type === lastAmount);

        if (allSame) {
            // Found 10 consecutive 1s! Group them.
            const firstJump = last10[0];
            const lastJump = last10[9];

            // Remove last 10 unit jumps
            this.jumps.splice(this.jumps.length - 10, 10);

            // Add grouped jump
            const groupedAmount = lastAmount * 10;
            this.jumps.push({
                type: groupedAmount,
                from: firstJump.from,
                to: lastJump.to,
                isGrouped: true // Flag for UI/Animation if needed
            });

            // We notify via the main flow, but we can also trigger a special event if we wanted.
            // For now, the standard notify will redraw showing the big jump.
        }
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
