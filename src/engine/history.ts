import { FillAction } from './types.js';

interface HistorySnapshot {
  imageData: ImageData;
  action?: FillAction;
}

export class HistoryManager {
  private undoStack: HistorySnapshot[] = [];
  private redoStack: HistorySnapshot[] = [];
  private actions: FillAction[] = [];
  private maxHistory: number = 25;
  private onStateChangeCallback?: (canUndo: boolean, canRedo: boolean) => void;

  constructor(maxHistory = 25) {
    this.maxHistory = maxHistory;
  }

  public setOnStateChange(cb: (canUndo: boolean, canRedo: boolean) => void): void {
    this.onStateChangeCallback = cb;
    this.notify();
  }

  /**
   * Saves a snapshot before an action takes place, clearing redo stack.
   */
  public pushSnapshot(snapshot: ImageData, action?: FillAction): void {
    // Clone ImageData to prevent mutation
    const copy = new ImageData(
      new Uint8ClampedArray(snapshot.data),
      snapshot.width,
      snapshot.height
    );

    this.undoStack.push({ imageData: copy, action });
    if (this.undoStack.length > this.maxHistory) {
      this.undoStack.shift();
    }

    if (action) {
      this.actions.push(action);
    }

    this.redoStack = [];
    this.notify();
  }

  public undo(currentImageData: ImageData): ImageData | null {
    if (this.undoStack.length === 0) return null;

    const previousEntry = this.undoStack.pop()!;

    // Save current state and the action being undone to redoStack
    const currentCopy = new ImageData(
      new Uint8ClampedArray(currentImageData.data),
      currentImageData.width,
      currentImageData.height
    );
    this.redoStack.push({ imageData: currentCopy, action: previousEntry.action });

    if (previousEntry.action && this.actions.length > 0) {
      this.actions.pop();
    }

    this.notify();
    return previousEntry.imageData;
  }

  public redo(currentImageData: ImageData): ImageData | null {
    if (this.redoStack.length === 0) return null;

    const nextEntry = this.redoStack.pop()!;

    const currentCopy = new ImageData(
      new Uint8ClampedArray(currentImageData.data),
      currentImageData.width,
      currentImageData.height
    );
    this.undoStack.push({ imageData: currentCopy, action: nextEntry.action });

    if (nextEntry.action) {
      this.actions.push(nextEntry.action);
    }

    this.notify();
    return nextEntry.imageData;
  }

  public clear(): void {
    this.undoStack = [];
    this.redoStack = [];
    this.actions = [];
    this.notify();
  }

  public getActions(): FillAction[] {
    return [...this.actions];
  }

  public setActions(actions: FillAction[]): void {
    this.actions = [...actions];
    this.redoStack = [];
    this.notify();
  }

  public get canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  public get canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  private notify(): void {
    if (this.onStateChangeCallback) {
      this.onStateChangeCallback(this.canUndo, this.canRedo);
    }
  }
}
