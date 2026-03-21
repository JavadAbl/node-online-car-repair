import cron from "node-cron";

// Define the type for the job wrapper
interface JobWrapper {
  name: string;
  cronExpression: string;
  task: cron.TaskFn;
  job: cron.ScheduledTask;
  options?: cron.TaskOptions;
}

class CronClient {
  // 1. State Storage
  // The Map is now an instance property, allowing multiple independent managers.
  private jobs: Map<string, JobWrapper>;

  constructor() {
    this.jobs = new Map<string, JobWrapper>();
  }

  // Internal helper to create the job object
  private initializeJob(
    name: string,
    cronExpression: string,
    task: cron.TaskFn,
    options: cron.TaskOptions,
  ): JobWrapper {
    const job = cron.schedule(cronExpression, task, options);

    return { name, cronExpression, task, job, options };
  }

  // 2. Functions

  /**
   * Add a cron job to the manager
   */
  public addJob(
    name: string,
    cronExpression: string,
    task: cron.TaskFn,
    startOnInit = true,
    options: cron.TaskOptions = {},
  ): void {
    if (this.jobs.has(name)) {
      throw new Error(`Job with name '${name}' already exists`);
    }

    const jobWrapper = this.initializeJob(name, cronExpression, task, options);
    this.jobs.set(name, jobWrapper);

    if (startOnInit) {
      jobWrapper.job.start();
    }
  }

  /**
   * Find a job by name
   */
  public findJob(name: string): JobWrapper | null {
    return this.jobs.get(name) || null;
  }

  /**
   * Start a job by name
   */
  public startJob(name: string): boolean {
    const jobWrapper = this.jobs.get(name);
    if (!jobWrapper) {
      return false;
    }

    jobWrapper.job.start();
    return true;
  }

  /**
   * Start all jobs
   */
  public startAllJobs(): void {
    this.jobs.forEach((jobWrapper) => {
      jobWrapper.job.start();
    });
  }

  /**
   * Stop a job by name
   */
  public stopJob(name: string): boolean {
    const jobWrapper = this.jobs.get(name);
    if (!jobWrapper) {
      return false;
    }

    jobWrapper.job.stop();
    return true;
  }

  /**
   * Stop all jobs
   */
  public stopAllJobs(): void {
    this.jobs.forEach((jobWrapper) => {
      jobWrapper.job.stop();
    });
  }

  /**
   * Pause a job by name (alias for stop)
   */
  public pauseJob(name: string): boolean {
    return this.stopJob(name);
  }

  /**
   * Remove a job by name
   */
  public removeJob(name: string): boolean {
    const jobWrapper = this.jobs.get(name);
    if (!jobWrapper) {
      return false;
    }

    jobWrapper.job.stop();
    jobWrapper.job.destroy();
    this.jobs.delete(name);
    return true;
  }

  /**
   * Get all job names
   */
  public getJobNames(): string[] {
    return Array.from(this.jobs.keys());
  }

  /**
   * Get all jobs
   */
  public getAllJobs(): JobWrapper[] {
    return Array.from(this.jobs.values());
  }
}

export const cronClient = new CronClient();
