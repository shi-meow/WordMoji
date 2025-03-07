// Cursor state management
let cursor = null;

// Initialize cursor module
function initCursor() {
    if (cursor) {
        cursor.style.display = 'block';
        return;
    }

    // Remove default cursor
    document.body.style.cursor = 'none';

    // Create custom cursor element
    cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    document.body.appendChild(cursor);

    // Update cursor position
    document.addEventListener('mousemove', updateCursor);

    // Handle cursor visibility when leaving/entering window
    document.addEventListener('mouseleave', () => {
        if (cursor) cursor.style.display = 'none';
    });

    document.addEventListener('mouseenter', () => {
        if (cursor) cursor.style.display = 'block';
    });
}

// Add hover effect to elements
function addCursorHoverEffect(elements) {
    if (!cursor) return;

    elements.forEach(element => {
        if (!element) return;
        
        element.addEventListener('mouseenter', () => {
            if (cursor) cursor.classList.add('hover');
        });
        element.addEventListener('mouseleave', () => {
            if (cursor) cursor.classList.remove('hover');
        });
    });
}

// Export cursor module functions
export { initCursor, addCursorHoverEffect };

function updateCursor(e) {
    if (!cursor) return;
    
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';

    const hoveredElement = document.elementFromPoint(e.clientX, e.clientY);
    if (hoveredElement && (
        hoveredElement.classList.contains('tile') || 
        hoveredElement.classList.contains('game-button') || 
        hoveredElement.classList.contains('play-button') || 
        hoveredElement.classList.contains('loading-emoji') ||
        hoveredElement.closest('.play-button')
    )) {
        cursor.classList.add('hover');
    } else {
        cursor.classList.remove('hover');
    }
}