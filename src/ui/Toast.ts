export class Toast {
  private static container: HTMLElement | null = null;
  private static timeoutId: number | null = null;

  public static init(): void {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'toast-pill';
      document.body.appendChild(this.container);
    }
  }

  public static show(message: string, duration = 2200): void {
    this.init();
    if (!this.container) return;

    if (this.timeoutId !== null) {
      window.clearTimeout(this.timeoutId);
    }

    this.container.textContent = message;
    this.container.classList.add('visible');

    this.timeoutId = window.setTimeout(() => {
      this.container?.classList.remove('visible');
      this.timeoutId = null;
    }, duration);
  }
}
