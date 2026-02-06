export class Renderer {
    constructor(containerId) {
        this.svg = document.getElementById(containerId);
        // Simple scaling
        this.width = this.svg.clientWidth || 800;
        this.height = this.svg.clientHeight || 400;
        // Re-check on resize
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        if (this.svg.parentElement) {
            this.width = this.svg.parentElement.clientWidth;
            this.height = this.svg.parentElement.clientHeight;
        }
        this.render(this.lastState);
    }

    render(state) {
        if (!state) return;
        this.lastState = state;

        // Clear SVG
        this.svg.innerHTML = '';

        // Ensure we have dimensions
        const rect = this.svg.getBoundingClientRect();
        if (rect.width > 0) this.width = rect.width;
        if (rect.height > 0) this.height = rect.height;

        // Determine scale
        // Range from startNumber to targetSum + padding
        // If no jumps, default range
        const minVal = state.startNumber - 5;
        const maxVal = Math.max(state.targetSum, state.currentSum) + 5;
        let range = maxVal - minVal;
        if (range < 20) range = 20;

        const paddingX = 50;
        const usableWidth = this.width - (paddingX * 2);
        const pixelsPerUnit = usableWidth / range;

        const getX = (val) => paddingX + (val - minVal) * pixelsPerUnit;
        const baseY = this.height * 0.7;

        // Draw Base Line
        this.createLine(paddingX - 20, baseY, this.width - paddingX + 20, baseY, '#cbd5e0', 4);
        // Arrows at ends of line
        this.createPath(`M ${paddingX - 20} ${baseY} L ${paddingX - 10} ${baseY - 5} M ${paddingX - 20} ${baseY} L ${paddingX - 10} ${baseY + 5}`, '#cbd5e0', 2);
        this.createPath(`M ${this.width - paddingX + 20} ${baseY} L ${this.width - paddingX + 10} ${baseY - 5} M ${this.width - paddingX + 20} ${baseY} L ${this.width - paddingX + 10} ${baseY + 5}`, '#cbd5e0', 2);


        // Draw Ticks and Numbers
        // We only draw ticks for relevant numbers: start, current, and jump points
        const pointsOfInterest = new Set([state.startNumber]);
        state.jumps.forEach(j => {
            pointsOfInterest.add(j.from);
            pointsOfInterest.add(j.to);
        });
        // Also target
        pointsOfInterest.add(state.targetSum);

        // Sort points
        const sortedPoints = Array.from(pointsOfInterest).sort((a, b) => a - b);

        sortedPoints.forEach(val => {
            const x = getX(val);
            this.createLine(x, baseY - 10, x, baseY + 10, '#4a5568', 2);
            this.createText(x, baseY + 35, val, '#2d3748', '18px');
        });

        // Draw Jumps
        state.jumps.forEach((jump, index) => {
            const startX = getX(jump.from);
            const endX = getX(jump.to);
            const midX = (startX + endX) / 2;

            // Height depends on jump size (10 vs 1)
            // Use positive height values relative to base
            const jumpHeight = jump.type === 10 ? 80 : 40;
            const controlY = baseY - jumpHeight; // Y is 0 at top

            const pathData = `M ${startX} ${baseY} Q ${midX} ${controlY} ${endX} ${baseY}`;
            const color = jump.type === 10 ? '#4c51bf' : '#ed8936';

            this.createPath(pathData, color, 3);

            // Label for jump
            this.createText(midX, controlY - 15, `+${jump.type}`, color, '14px');
        });

        // Draw current position indicator (small circle)
        const currentX = getX(state.currentSum);
        this.createCircle(currentX, baseY, 6, '#e53e3e');
    }

    createLine(x1, y1, x2, y2, color, width) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        line.setAttribute('stroke', color);
        line.setAttribute('stroke-width', width);
        line.setAttribute('stroke-linecap', 'round');
        this.svg.appendChild(line);
    }

    createPath(d, color, width) {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', d);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', color);
        path.setAttribute('stroke-width', width);
        path.setAttribute('stroke-linecap', 'round');
        this.svg.appendChild(path);
    }

    createText(x, y, text, color, fontSize = '16px') {
        const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        txt.setAttribute('x', x);
        txt.setAttribute('y', y);
        txt.setAttribute('fill', color);
        txt.setAttribute('font-size', fontSize);
        txt.setAttribute('font-family', 'Outfit, sans-serif');
        txt.setAttribute('text-anchor', 'middle');
        txt.setAttribute('font-weight', 'bold');
        txt.textContent = text;
        this.svg.appendChild(txt);
    }

    createCircle(cx, cy, r, color) {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', cx);
        circle.setAttribute('cy', cy);
        circle.setAttribute('r', r);
        circle.setAttribute('fill', color);
        this.svg.appendChild(circle);
    }
}
