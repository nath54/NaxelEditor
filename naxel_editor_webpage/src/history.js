/**
 * Undo/Redo History Manager for Naxel Editor
 */

window.historyManager = {
    undoStack: [],
    redoStack: [],

    /**
     * Save current state to undo stack
     */
    saveState() {
        const maxSize = window.naxelConfig?.maxUndoSteps || 50;
        const state = JSON.stringify(window.naxel_objects["main_naxel"]);

        this.undoStack.push(state);
        if (this.undoStack.length > maxSize) {
            this.undoStack.shift();
        }

        // Clear redo stack on new action
        this.redoStack = [];
    },

    /**
     * Undo last action
     */
    undo() {
        if (this.undoStack.length === 0) {
            console.log("Nothing to undo");
            return;
        }

        // Save current state to redo stack
        const current = JSON.stringify(window.naxel_objects["main_naxel"]);
        this.redoStack.push(current);

        // Restore previous state
        const previous = this.undoStack.pop();
        window.naxel_objects["main_naxel"] = JSON.parse(previous);

        triggerRerender();
    },

    /**
     * Redo last undone action
     */
    redo() {
        if (this.redoStack.length === 0) {
            console.log("Nothing to redo");
            return;
        }

        // Save current state to undo stack
        const current = JSON.stringify(window.naxel_objects["main_naxel"]);
        this.undoStack.push(current);

        // Restore next state
        const next = this.redoStack.pop();
        window.naxel_objects["main_naxel"] = JSON.parse(next);

        triggerRerender();
    },

    /**
     * Clear all history
     */
    clear() {
        this.undoStack = [];
        this.redoStack = [];
    },

    /**
     * Check if undo is available
     */
    canUndo() {
        return this.undoStack.length > 0;
    },

    /**
     * Check if redo is available
     */
    canRedo() {
        return this.redoStack.length > 0;
    }
};

// Keyboard shortcuts for undo/redo
document.addEventListener("keydown", (e) => {
    // Ctrl+Z = Undo, Ctrl+Shift+Z or Ctrl+Y = Redo
    if (e.ctrlKey && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) {
            window.historyManager.redo();
        } else {
            window.historyManager.undo();
        }
    }
    if (e.ctrlKey && e.key === "y") {
        e.preventDefault();
        window.historyManager.redo();
    }
});
