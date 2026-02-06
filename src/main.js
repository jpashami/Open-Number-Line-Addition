import { GameState } from './game.js';
import { Renderer } from './renderer.js';

// Wait for DOM
document.addEventListener('DOMContentLoaded', () => {
    const gameState = new GameState();
    const renderer = new Renderer('number-line-svg');

    // Elements
    // Use try-catch or checks to avoid null errors if IDs change
    const equationTextEl = document.getElementById('equation-text');
    const btn10 = document.getElementById('jump-10-btn');
    const btn1 = document.getElementById('jump-1-btn');
    const btnUndo = document.getElementById('undo-btn');
    const btnReset = document.getElementById('reset-btn');
    const btnNew = document.getElementById('new-problem-btn');
    const feedbackEl = document.getElementById('feedback');

    // Subscribe to state changes
    gameState.subscribe((state) => {
        // Render SVG
        renderer.render(state);

        // Update UI
        if (state.targetSum > 0) {

            if (state.isComplete()) {
                equationTextEl.innerHTML = `<span>${state.startNumber}</span> + <span>${state.numberToAdd}</span> = <span style="color:var(--success-color);">${state.targetSum}</span>`;
            } else {
                equationTextEl.innerHTML = `<span>${state.startNumber}</span> + <span>${state.numberToAdd}</span> = <span>?</span>`;
            }

            // Calc remainder
            const remaining = state.targetSum - state.currentSum;

            // Buttons state
            // Disable if move would exceed target
            btn10.disabled = remaining < 10; // Simple logic: if < 10 left, can't jump 10? 
            // Actually, for educational purposes, maybe we let them try and fail?
            // The GameState.addJump returns false if invalid.
            // Let's disable to guide them, or keep enabled and show shake?
            // Plan said "Logic to check...". Let's guide them via disabled state for better UX.
            btn10.disabled = remaining < 10 || state.isComplete();
            btn1.disabled = remaining < 1 || state.isComplete();

            btnUndo.disabled = state.jumps.length === 0 || state.isComplete();
            btnReset.disabled = state.jumps.length === 0;

            // Feedback
            if (state.isComplete()) {
                feedbackEl.textContent = 'Correct! Great Job!';
                feedbackEl.classList.add('visible');
                triggerConfetti();
            } else {
                feedbackEl.textContent = '';
                feedbackEl.classList.remove('visible');
            }
        }
    });

    // Event Listeners
    btnNew.addEventListener('click', () => {
        gameState.startNewGame();
    });

    btn10.addEventListener('click', () => {
        if (!gameState.addJump(10)) {
            // Shake effect if fail logic was allowed but returned false
            btn10.classList.add('shake');
            setTimeout(() => btn10.classList.remove('shake'), 500);
        }
    });

    btn1.addEventListener('click', () => {
        if (!gameState.addJump(1)) {
            btn1.classList.add('shake');
            setTimeout(() => btn1.classList.remove('shake'), 500);
        }
    });

    btnUndo.addEventListener('click', () => {
        gameState.undo();
    });

    btnReset.addEventListener('click', () => {
        gameState.reset();
    });

    // Start one initially
    gameState.startNewGame();
});

function triggerConfetti() {
    // Simple visual flash
    const app = document.getElementById('app');
    app.style.boxShadow = '0 0 50px #48bb78';
    setTimeout(() => {
        app.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
    }, 800);
}
