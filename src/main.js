import { GameState } from './game.js';
import { Renderer } from './renderer.js';

// Wait for DOM
document.addEventListener('DOMContentLoaded', () => {
    const gameState = new GameState();
    const renderer = new Renderer('number-line-svg');

    // Elements
    // Use try-catch or checks to avoid null errors if IDs change
    // Elements
    const equationTextEl = document.getElementById('equation-text');
    const jumpPresetBtns = document.querySelectorAll('.jump-preset-btn');
    const customJumpInput = document.getElementById('custom-jump-val');
    const btnAddCustom = document.getElementById('add-custom-btn');
    const btnSubCustom = document.getElementById('sub-custom-btn');

    const btnUndo = document.getElementById('undo-btn');
    const btnReset = document.getElementById('reset-btn');
    const btnNew = document.getElementById('new-problem-btn');

    // Inline Edit elements
    const displayMode = document.getElementById('display-mode');
    const editMode = document.getElementById('edit-mode');
    const btnEdit = document.getElementById('edit-btn');
    const btnSaveCustom = document.getElementById('save-custom-btn');
    const btnCancelEdit = document.getElementById('cancel-edit-btn');
    const inputStart = document.getElementById('inline-start');
    const inputChange = document.getElementById('inline-change');

    const feedbackEl = document.getElementById('feedback');
    const modeBtns = document.querySelectorAll('.mode-btn');

    // Subscribe to state changes
    gameState.subscribe((state) => {
        // Render SVG
        renderer.render(state);

        // Update Story Text
        equationTextEl.textContent = state.story.text;

        // Button States
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

    btnNew.addEventListener('click', () => {
        gameState.startNewGame();
    });

    jumpPresetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const amount = parseInt(btn.getAttribute('data-jump'));
            if (!gameState.addJump(amount)) {
                btn.classList.add('shake');
                setTimeout(() => btn.classList.remove('shake'), 500);
            }
        });
    });

    btnAddCustom.addEventListener('click', () => {
        const val = parseInt(customJumpInput.value);
        if (!isNaN(val) && val > 0) {
            gameState.addJump(val);
        }
    });

    btnSubCustom.addEventListener('click', () => {
        const val = parseInt(customJumpInput.value);
        if (!isNaN(val) && val > 0) {
            gameState.addJump(-val);
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

    const handleSave = () => {
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
    };

    btnSaveCustom.addEventListener('click', handleSave);

    inputStart.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') inputChange.focus();
    });
    inputChange.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSave();
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
