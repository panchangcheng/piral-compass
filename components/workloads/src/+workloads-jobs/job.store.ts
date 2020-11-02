import { KubeObjectStore } from "compass-base/client/kube-object.store";
import { autobind } from "compass-base/client/utils";
import { Job, jobApi } from "compass-base/client/api/endpoints/job.api";
import { CronJob, Pod, PodStatus } from "compass-base/client/api/endpoints";
import { podsStore } from "../+workloads-pods/pods.store";

@autobind()
export class JobStore extends KubeObjectStore<Job> {
  api = jobApi

  getChildPods(job: Job): Pod[] {
    return podsStore.getPodsByOwner(job)
  }

  getJobsByOwner(cronJob: CronJob) {
    return this.items.filter(job =>
      job.getNs() == cronJob.getNs() &&
      job.getOwnerRefs().find(ref => ref.name === cronJob.getName() && ref.kind === cronJob.kind)
    )
  }

  getStatuses(jobs?: Job[]) {
    const status = { failed: 0, pending: 0, running: 0, succeeded: 0 }
    jobs.forEach(job => {
      const pods = this.getChildPods(job)
      if (pods.some(pod => pod.getStatus() === PodStatus.FAILED)) {
        status.failed++
      }
      else if (pods.some(pod => pod.getStatus() === PodStatus.PENDING)) {
        status.pending++
      }
      else if (pods.some(pod => pod.getStatus() === PodStatus.RUNNING)) {
        status.running++
      }
      else {
        status.succeeded++
      }
    })
    return status
  }
}

export const jobStore = new JobStore();

