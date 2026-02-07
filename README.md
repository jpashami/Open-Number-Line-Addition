# Open Number Line Master 🧮

A fun, interactive educational tool to help students understand addition and subtraction using the "Open Number Line" strategy.

![License](https://img.shields.io/badge/license-MIT-blue)
![Version](https://img.shields.io/badge/version-1.1.0-green)

## Features
*   **Addition Mode**: Practice adding numbers by jumping +10 or +1.
*   **Commutative Property (Swap Mode)**: See how $25 + 30$ is the same as $30 + 25$, but the jumps look different!
*   **Subtraction Mode**: Start high and jump backwards (-10, -1) to find the difference.
*   **Custom Problems**: Enter your own starting number and amount to add/subtract for personalized practice.
*   **Smart Grouping ✨**: Automatically combines 10 consecutive unit jumps (+1/-1) into a single "group of ten" jump (+10/-10) to reinforce place value concepts.
*   **Visual Feedback**: Animated number line with "humps" for each jump.
*   **Confetti**: Celebratory effects for correct answers!

## How to Play
1.  **Select a Mode**: Choose Addition, Swap, or Subtraction.
2.  **Custom Problem**: Click the "Custom" button to set your own math problem.
3.  **Make Jumps**: Use the +10/+1 (or -10/-1) buttons to move along the number line.
    *   Try to use "friendly numbers" (like multiples of 10) where possible.
    *   Watch 10 "ones" turn into a "ten" automatically!
4.  **Reach the Goal**: Land exactly on the target number to win!

## Technical Details
This app is built with:
*   **Vanilla JavaScript**: No heavy frameworks, just clean code.
*   **Vite**: Fast development and building.
*   **SVG**: Scalable vector graphics for the number line rendering.

## Running Locally
Prerequisites: Node.js v20.19+ or v22+ (LTS).

1.  Clone the repository:
    ```bash
    git clone https://github.com/jpashami/hundred-chart-chase.git
    cd Open-Number-Line-Addition
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the dev server:
    ```bash
    npm run dev
    ```
4.  Open the link shown in your terminal (usually `http://localhost:5173`).

## License
MIT License - Free for everyone to use and modify. Provided "AS-IS" without warranty.
