/* ============================================================
 * js/learning/huruf/huruf-utils.js
 * Utility Drag & Drop — dipakai oleh semua modul huruf & menulis
 * ============================================================ */

// --- UTILITY: DRAG AND DROP (POINTER EVENTS) ---
function initPointerDrag(element, parentElement, onDragMove, onDragEnd) {
    let startX = 0, startY = 0;
    let initialLeft = 0, initialTop = 0;

    element.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        element.setPointerCapture(e.pointerId);

        element.style.animation = 'none';
        element.style.transform = 'scale(1.15)';
        element.style.boxShadow = '0 8px 12px rgba(0,0,0,0.3)';

        startX = e.clientX;
        startY = e.clientY;

        const rect = element.getBoundingClientRect();
        const parentRect = parentElement.getBoundingClientRect();
        initialLeft = rect.left - parentRect.left;
        initialTop = rect.top - parentRect.top;

        const onPointerMove = (moveEv) => {
            const dx = moveEv.clientX - startX;
            const dy = moveEv.clientY - startY;

            let newLeft = initialLeft + dx;
            let newTop = initialTop + dy;

            const parentWidth = parentRect.width;
            const parentHeight = parentRect.height;
            newLeft = Math.max(0, Math.min(newLeft, parentWidth - rect.width));
            newTop = Math.max(0, Math.min(newTop, parentHeight - rect.height));

            element.style.left = `${newLeft}px`;
            element.style.top = `${newTop}px`;

            if (onDragMove) onDragMove(element, newLeft, newTop);
        };

        const onPointerUp = (upEv) => {
            element.removeEventListener('pointermove', onPointerMove);
            element.removeEventListener('pointerup', onPointerUp);
            element.releasePointerCapture(upEv.pointerId);

            element.style.transform = '';
            element.style.boxShadow = '';

            if (onDragEnd) onDragEnd(element, initialLeft, initialTop);
        };

        element.addEventListener('pointermove', onPointerMove);
        element.addEventListener('pointerup', onPointerUp);
    });
}

// --- UTILITY: CEK TUMPANG TINDIH DUA ELEMEN ---
function isOverlapping(rectA, rectB, threshold = 0.2) {
    const overlapX = Math.max(0, Math.min(rectA.right, rectB.right) - Math.max(rectA.left, rectB.left));
    const overlapY = Math.max(0, Math.min(rectA.bottom, rectB.bottom) - Math.max(rectA.top, rectB.top));
    const overlapArea = overlapX * overlapY;
    const areaA = (rectA.right - rectA.left) * (rectA.bottom - rectA.top);
    return overlapArea / areaA >= threshold;
}

// --- HELPER: BOUNCE BACK ELEMENT KE POSISI ASAL ---
function bounceBack(el, left, top, delay = 400) {
    el.style.transition = 'left 0.4s ease, top 0.4s ease';
    el.style.left = `${left}%`;
    el.style.top = `${top}%`;
    setTimeout(() => {
        el.style.transition = '';
    }, delay);
}
