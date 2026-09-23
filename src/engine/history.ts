import { FillAction } from './types.js';

export class HistoryManager {
  private undoStack: ImageData[] = [];
  private redoStack: ImageData[] = [];
  private actions: FillAction[] = [];
  private maxHistory: number = 20;
  private onStateChangeCallback?: (canUndo: boolean, canRedo: boolean) => void;

  constructor(maxHistory = 20) {
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

    this.undoStack.push(copy);
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

    // Save current state to redo
    const currentCopy = new ImageData(
      new Uint8ClampedArray(currentImageData.data),
      currentImageData.width,
      currentImageData.height
    );
    this.redoStack.push(currentCopy);

    const previousState = this.undoStack.pop()!;
    if (this.actions.length > 0) {
      this.actions.pop();
    }

    this.notify();
    return previousState;
  }

  public redo(currentImageData: ImageData): ImageData | null {
    if (this.redoStack.length === 0) return null;

    const currentCopy = new ImageData(
      new Uint8ClampedArray(currentImageData.data),
      currentImageData.width,
      currentImageData.height
    );
    this.undoStack.push(currentCopy);

    const nextState = this.redoStack.pop()!;
    this.notify();
    return nextState;
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
