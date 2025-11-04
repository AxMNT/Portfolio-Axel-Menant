    /* ====== PARAMÈTRES ====== */
    const CELL_SIZE = 15; // px → plus petit = plus de cases
    const GAP = 5; // espace entre cases
    const RADIUS = 3; // rayon propagation
    const DECAY = 1.8; // vitesse de disparition
    const MAX_CELLS = 6000; // limite max pour gros écrans
    /* ======================== */

    const grid = document.querySelector('.background-effect .grid');
    grid.style.setProperty('--gap', GAP + 'px');

    let cols, rows, cells = [];
    let actives = new Set();
    let lastCellIndex = -1;

    function build() {
        const maxCols = Math.floor(innerWidth / (CELL_SIZE + GAP));
        const maxRows = Math.floor(innerHeight / (CELL_SIZE + GAP));
        const totalCells = maxCols * maxRows;

        if (totalCells > MAX_CELLS) {
            const ratio = Math.sqrt(MAX_CELLS / totalCells);
            cols = Math.floor(maxCols * ratio);
            rows = Math.floor(maxRows * ratio);
        } else {
            cols = maxCols;
            rows = maxRows;
        }

        grid.style.gridTemplateColumns = `repeat(${cols}, ${CELL_SIZE}px)`;
        grid.innerHTML = '';
        cells = [];

        for (let i = 0; i < cols * rows; i++) {
            const c = document.createElement('div');
            c.className = 'cell';
            c._i = 0;
            c.style.width = CELL_SIZE + 'px';
            c.style.height = CELL_SIZE + 'px';
            c.style.background = 'rgba(255,255,255,0.03)';
            grid.appendChild(c);
            cells.push(c);
        }
    }
    build();
    addEventListener('resize', build);

    const cursor = document.querySelector('.background-effect .cursor');

    function move(x, y) {
        cursor.style.left = x + 'px';
        cursor.style.top = y + 'px';

        const col = Math.floor(x / (CELL_SIZE + GAP));
        const row = Math.floor(y / (CELL_SIZE + GAP));
        if (col < 0 || row < 0 || col >= cols || row >= rows) return;

        const idx = row * cols + col;
        if (idx !== lastCellIndex) {
            lastCellIndex = idx;
            for (let dy = -RADIUS; dy <= RADIUS; dy++) {
                for (let dx = -RADIUS; dx <= RADIUS; dx++) {
                    const nc = col + dx,
                        nr = row + dy;
                    if (nc < 0 || nr < 0 || nc >= cols || nr >= rows) continue;
                    const dist = Math.hypot(dx, dy);
                    const s = Math.max(0, 1 - dist / (RADIUS + 0.001));
                    const el = cells[nr * cols + nc];
                    el._i = Math.min(1, el._i + s * 0.95);
                    actives.add(el);
                }
            }
        }
    }
    addEventListener('mousemove', e => move(e.clientX, e.clientY));
    addEventListener('touchmove', e => {
        const t = e.touches[0];
        if (t) move(t.clientX, t.clientY);
    }, {
        passive: true
    });

    let lastT = performance.now();

    function loop(now) {
        const dt = (now - lastT) / 1000;
        lastT = now;

        for (const el of actives) {
            el._i -= DECAY * dt;
            if (el._i <= 0) {
                el._i = 0;
                actives.delete(el);
                el.style.background = 'rgba(255,255,255,0.03)';
                el.style.boxShadow = '';
                el.style.transform = '';
            } else {
                el.style.background = `rgba(255,255,255,${0.06+el._i*0.5})`;
                el.style.boxShadow = `0 4px ${6*el._i}px rgba(255,255,255,${0.05*el._i})`;
                el.style.transform = `scale(${1+el._i*0.5})`;
            }
        }

        requestAnimationFrame(loop);
    }
    loop();