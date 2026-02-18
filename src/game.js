export class GameState {
    constructor() {
        this.mode = 'join'; // 'join', 'separate', 'compare', 'part-part-whole'
        this.startNumber = 0;
        this.targetSum = 0;
        this.currentSum = 0;
        this.jumps = [];
        this.listeners = [];

        // Detailed story info
        this.story = {
            type: 'join',
            subType: 'result-unknown',
            text: '',
            a: 0,
            b: 0,
            unknown: 'result' // 'result', 'change', 'start'
        };
    }

    setMode(mode) {
        this.mode = mode;
        this.startNewGame();
    }

    startNewGame() {
        const stories = this.generateStory(this.mode);
        this.story = stories[Math.floor(Math.random() * stories.length)];

        // Setup game based on story
        if (this.story.type === 'join' || this.story.type === 'part-part-whole') {
            this.startNumber = this.story.unknown === 'start' ? 0 : this.story.a;
            this.targetSum = this.story.a + this.story.b;
        } else if (this.story.type === 'separate') {
            this.startNumber = this.story.unknown === 'start' ? 0 : this.story.a;
            this.targetSum = this.story.a - this.story.b;
        } else if (this.story.type === 'compare') {
            this.startNumber = this.story.a;
            this.targetSum = this.story.b;
        }

        this.currentSum = this.startNumber;
        this.jumps = [];
        this.notify();
    }

    generateStory(mode) {
        const A = Math.floor(Math.random() * 40) + 10;
        const B = Math.floor(Math.random() * 20) + 5;

        switch (mode) {
            case 'join':
                return [
                    { type: 'join', subType: 'result-unknown', unknown: 'result', a: A, b: B, text: `Pat has ${A} marbles. Her brother gives her ${B}. How many does she have now?` },
                    { type: 'join', subType: 'change-unknown', unknown: 'change', a: A, b: B, text: `Pat has ${A} marbles but wants ${A + B}. How many more does she need?` },
                    { type: 'join', subType: 'start-unknown', unknown: 'start', a: A, b: B, text: `Pat has some marbles. Her brother gave her ${B} and now she has ${A + B}. How many did she start with?` }
                ];
            case 'separate':
                return [
                    { type: 'separate', subType: 'result-unknown', unknown: 'result', a: A + B, b: B, text: `Pat has ${A + B} marbles. She gives her brother ${B}. How many are left?` },
                    { type: 'separate', subType: 'change-unknown', unknown: 'change', a: A + B, b: B, text: `Pat had ${A + B} marbles. She gave some away and now has ${A}. How many did she give?` }
                ];
            case 'part-part-whole':
                return [
                    { type: 'part-part-whole', subType: 'whole-unknown', unknown: 'result', a: A, b: B, text: `Pat has ${A} blue marbles and ${B} green marbles. How many in all?` },
                    { type: 'part-part-whole', subType: 'part-unknown', unknown: 'change', a: A, b: B, text: `Pat has ${A + B} marbles. ${A} are blue, the rest are green. How many green?` }
                ];
            case 'compare':
                return [
                    { type: 'compare', subType: 'difference-unknown', unknown: 'change', a: B, b: A + B, text: `Pat has ${A + B} blue marbles and ${B} green marbles. How many more blue marbles does she have?` }
                ];
            default:
                return [{ type: 'join', subType: 'result-unknown', unknown: 'result', a: 10, b: 5, text: 'Problem loading...' }];
        }
    }

    startCustomGame(start, changeVal) {
        this.startNumber = start;
        this.targetSum = start + changeVal; // Default behavior
        this.currentSum = this.startNumber;
        this.jumps = [];
        this.story.text = "Custom Problem";
        this.notify();
    }

    addJump(amount) {
        // We now allow any amount, but we still check for overshoot if it's subtraction logic
        const isSubtracting = (this.mode === 'separate' && this.story.unknown !== 'start');

        if (isSubtracting) {
            if (this.currentSum + amount < this.targetSum && amount < 0) {
                // return false; // Maybe allow overshoot? Teachers often like students to see they went too far.
            }
        } else {
            if (this.currentSum + amount > this.targetSum && amount > 0) {
                // return false;
            }
        }

        const from = this.currentSum;
        this.currentSum += amount;
        this.jumps.push({ type: amount, from, to: this.currentSum });

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
