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
    const btnNeg10 = document.getElementById('jump-neg-10-btn');
    const btnNeg1 = document.getElementById('jump-neg-1-btn');
    const btnUndo = document.getElementById('undo-btn');
    const btnReset = document.getElementById('reset-btn');
    const btnNew = document.getElementById('new-problem-btn');
    const btnSwap = document.getElementById('swap-btn');
    const btnHelp = document.getElementById('help-btn');
    const btnCloseHelp = document.getElementById('close-help-btn');
    const helpModal = document.getElementById('help-modal');

    // Inline Edit elements
    const displayMode = document.getElementById('display-mode');
    const editMode = document.getElementById('edit-mode');
    const btnEdit = document.getElementById('edit-btn');
    const btnSaveCustom = document.getElementById('save-custom-btn');
    const btnCancelEdit = document.getElementById('cancel-edit-btn');
    const inputStart = document.getElementById('inline-start');
    const inputChange = document.getElementById('inline-change');
    const operatorText = document.getElementById('operator-text');

    const feedbackEl = document.getElementById('feedback');
    const addButtons = document.getElementById('add-buttons');
    const subButtons = document.getElementById('sub-buttons');
    const modeBtns = document.querySelectorAll('.mode-btn');

    // Subscribe to state changes
    gameState.subscribe((state) => {
        // Render SVG
        renderer.render(state);

        // Update UI Visibility based on mode
        if (state.mode === 'subtraction') {
            addButtons.classList.add('hidden');
            subButtons.classList.remove('hidden');
            btnSwap.classList.add('hidden');
        } else {
            addButtons.classList.remove('hidden');
            subButtons.classList.add('hidden');
            if (state.mode === 'commutative') {
                btnSwap.classList.remove('hidden');
            } else {
                btnSwap.classList.add('hidden');
            }
        }

        // Update Equation Text
        if (state.targetSum !== undefined) {
            let equationHTML = '';
            if (state.mode === 'subtraction') {
                operatorText.textContent = '-';
                if (state.isComplete()) {
                    equationHTML = `<span>${state.startNumber}</span> - <span>${state.numberToAdd}</span> = <span style="color:var(--success-color);">${state.targetSum}</span>`;
                } else {
                    equationHTML = `<span>${state.startNumber}</span> - <span>${state.numberToAdd}</span> = <span>?</span>`;
                }
            } else {
                operatorText.textContent = '+';
                if (state.isComplete()) {
                    equationHTML = `<span>${state.startNumber}</span> + <span>${state.numberToAdd}</span> = <span style="color:var(--success-color);">${state.targetSum}</span>`;
                } else {
                    equationHTML = `<span>${state.startNumber}</span> + <span>${state.numberToAdd}</span> = <span>?</span>`;
                }
            }
            equationTextEl.innerHTML = equationHTML;


            // Button States
            if (state.mode === 'subtraction') {
                // Moving down towards target
                const remainingDist = state.currentSum - state.targetSum;
                // btnNeg10 (jump -10)
                btnNeg10.disabled = remainingDist < 10 || state.isComplete();
                btnNeg1.disabled = remainingDist < 1 || state.isComplete();
            } else {
                // Moving up towards target
                const remaining = state.targetSum - state.currentSum;
                btn10.disabled = remaining < 10 || state.isComplete();
                btn1.disabled = remaining < 1 || state.isComplete();
            }

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
    modeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            modeBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            const mode = e.target.getAttribute('data-mode');
            gameState.setMode(mode);
        });
    });

    btnSwap.addEventListener('click', () => {
        gameState.swapCommutative();
    });

    btnNew.addEventListener('click', () => {
        gameState.startNewGame();
    });

    btn10.addEventListener('click', () => {
        if (!gameState.addJump(10)) {
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

    btnNeg10.addEventListener('click', () => {
        if (!gameState.addJump(-10)) {
            btnNeg10.classList.add('shake');
            setTimeout(() => btnNeg10.classList.remove('shake'), 500);
        }
    });

    btnNeg1.addEventListener('click', () => {
        if (!gameState.addJump(-1)) {
            btnNeg1.classList.add('shake');
            setTimeout(() => btnNeg1.classList.remove('shake'), 500);
        }
    });

    btnUndo.addEventListener('click', () => {
        gameState.undo();
    });

    btnReset.addEventListener('click', () => {
        gameState.reset();
    });

    // Help Modal Logic
    btnHelp.addEventListener('click', () => {
        helpModal.classList.remove('hidden');
    });
    btnCloseHelp.addEventListener('click', () => {
        helpModal.classList.add('hidden');
    });

    // Inline Custom Problem Logic
    btnEdit.addEventListener('click', () => {
        displayMode.classList.add('hidden');
        editMode.classList.remove('hidden');
        inputStart.value = gameState.startNumber;
        inputChange.value = gameState.numberToAdd;
        inputStart.focus();
    });

    btnCancelEdit.addEventListener('click', () => {
        displayMode.classList.remove('hidden');
        editMode.classList.add('hidden');
    });

    btnSaveCustom.addEventListener('click', () => {
        const start = parseInt(inputStart.value);
        const change = parseInt(inputChange.value);

        if (isNaN(start) || isNaN(change) || start < 0 || change <= 0) {
            editMode.classList.add('shake');
            setTimeout(() => editMode.classList.remove('shake'), 500);
            return;
        }

        gameState.startCustomGame(start, change);
        displayMode.classList.remove('hidden');
        editMode.classList.add('hidden');
    });

    // Close on outside click
    window.addEventListener('click', (e) => {
        if (e.target === helpModal) {
            helpModal.classList.add('hidden');
        }
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
