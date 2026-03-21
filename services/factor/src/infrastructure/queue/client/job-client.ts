import Queue from "bee-queue";

class JobClient {
  async create(queue: Queue, data: any) {
    const job = queue.createJob(data);

    job
      .on("succeeded", (result) => {
        console.log(`Job ${job.id} completed with result:`, result);
      })
      .on("failed", (err) => {
        console.error(`Job ${job.id} failed with error:`, err.message);
      });

    await job.save();
  }
}

export const jobClient = new JobClient();
