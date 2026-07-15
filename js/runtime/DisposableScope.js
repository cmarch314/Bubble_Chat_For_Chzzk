class DisposableScope {
    constructor() {
        this.disposables = new Set();
        this.disposed = false;
    }

    add(disposable) {
        if (!disposable) return disposable;
        if (this.disposed) {
            this._disposeOne(disposable);
            return disposable;
        }
        this.disposables.add(disposable);
        return disposable;
    }

    remove(disposable) {
        this.disposables.delete(disposable);
    }

    dispose() {
        if (this.disposed) return;
        this.disposed = true;
        const pending = [...this.disposables].reverse();
        this.disposables.clear();
        for (const disposable of pending) {
            try {
                this._disposeOne(disposable);
            } catch (error) {
                console.error('[DisposableScope] Cleanup failed:', error);
            }
        }
    }

    _disposeOne(disposable) {
        if (typeof disposable === 'function') disposable();
        else if (typeof disposable.dispose === 'function') disposable.dispose();
        else if (typeof disposable.abort === 'function') disposable.abort();
        else if (typeof disposable.remove === 'function') disposable.remove();
    }
}
