export interface TaskWorkerOptions {
  callback: (...args: any[]) => Promise<any>;
  period: number;
  retryAfter: number;
  lockTriggerDelay: number;
}
export class TaskWorker {
  constructor(private options: TaskWorkerOptions) {
    this.enabled = false;
    this.triggerLocked = false;
  }

  private enabled = false;

  private triggerLocked = false;

  private workerHandler: any;

  private work(afterTime: number) {
    if (!this.enabled || (afterTime < 0 && this.options.lockTriggerDelay < 1)) {
      return;
    }
    this.workerHandler = setTimeout(() => {
      this.options
        .callback()
        .then(() => this.work(this.options.period * 1000))
        .catch(() => this.work(this.options.retryAfter * 1000));
    }, afterTime || 0);
  }

  private triggerLocker(delay: number) {
    if (!delay || delay < 1) {
      return;
    }
    this.triggerLocked = true;
    setTimeout(() => {
      this.triggerLocked = false;
    }, this.options.lockTriggerDelay);
  }

  public trigger() {
    if (this.triggerLocked) {
      return;
    }
    this.triggerLocker(this.options.lockTriggerDelay);
    if (this.workerHandler && !this.workerHandler._called) {
      clearTimeout(this.workerHandler);
      this.work(0);
    }
  }

  public start() {
    this.enabled = true;
    this.work(this.options.period);
  }

  public stop() {
    if (this.workerHandler) {
      clearTimeout(this.workerHandler);
    }
    this.enabled = false;
  }
}
