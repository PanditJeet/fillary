import { FillAction } from './types.js';
import { FillDiff } from './floodFill.js';

export interface HistoryEntry extends FillDiff {
  action?: FillAction;
}

/**
 * Undo/redo history that stores only the pixels each fill changed
 * (instead of full 4 MB canvas snapshots), keeping memory low on phones.
 */
export class HistoryManager {
  private undoStack: HistoryEntry[] = [];
  private redoStack: HistoryEntry[] = [];
  private actions: FillAction[] = [];
  private maxHistory: number;
  private maxBytes: number;
  private undoBytes = 0;
  private onStateChangeCallback?: (canUndo: boolean, canRedo: boolean) => void;

  constructor(maxHistory = 100, maxBytes = 48 * 1024 * 1024) {
    this.maxHistory = maxHistory;
    this.maxBytes = maxBytes;
  }

  public setOnStateChange(cb: (canUndo: boolean, canRedo: boolean) => void): void {
    this.onStateChangeCallback = cb;
    this.notify();
  }

  private static sizeOf(entry: HistoryEntry): number {
    return entry.indices.byteLength + entry.before.byteLength;
  }

  /**
   * Records a completed fill. Clears the redo stack.
   */
  public push(entry: HistoryEntry, notify = true): void {
    this.undoStack.push(entry);
    this.undoBytes += HistoryManager.sizeOf(entry);

    while (
      this.undoStack.length > 1 &&
      (this.undoStack.length > this.maxHistory || this.undoBytes > this.maxBytes)
    ) {
      const dropped = this.undoStack.shift()!;
      this.undoBytes -= HistoryManager.sizeOf(dropped);
    }

    if (entry.action) {
      this.actions.push(entry.action);
    }

    this.redoStack = [];
    if (notify) this.notify();
  }

  /** Records an action that is not undoable (e.g. older replayed fills beyond the history window). */
  public pushActionOnly(action: FillAction): void {
    this.actions.push(action);
  }

  /** Returns the entry to revert (caller writes `before` values back), or null. */
  public undo(): HistoryEntry | null {
    const entry = this.undoStack.pop();
    if (!entry) return null;
    this.undoBytes -= HistoryManager.sizeOf(entry);
    this.redoStack.push(entry);
    if (entry.action && this.actions.length > 0) {
      this.actions.pop();
    }
    this.notify();
    return entry;
  }

  /** Returns the entry to re-apply (caller writes `after` color back), or null. */
  public redo(): HistoryEntry | null {
    const entry = this.redoStack.pop();
    if (!entry) return null;
    this.undoStack.push(entry);
    this.undoBytes += HistoryManager.sizeOf(entry);
    if (entry.action) {
      this.actions.push(entry.action);
    }
    this.notify();
    return entry;
  }

  public clear(): void {
    this.undoStack = [];
    this.redoStack = [];
    this.actions = [];
    this.undoBytes = 0;
    this.notify();
  }

  public getActions(): FillAction[] {
    return [...this.actions];
  }

  public get actionCount(): number {
    return this.actions.length;
  }

  public get canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  public get canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  public notify(): void {
    if (this.onStateChangeCallback) {
      this.onStateChangeCallback(this.canUndo, this.canRedo);
    }
  }
}
