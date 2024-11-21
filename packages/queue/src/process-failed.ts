import { handler } from './handler'
import { getQueue, QueueName } from './utils'

async function main() {
  const usePromotePost = !!process.argv[2]
  const queueName = usePromotePost ? QueueName.PromotePost : QueueName.Default
  const queue = getQueue(queueName)
  const failed = await queue.getFailed()
  console.log(new Date().toISOString(), 'found', failed.length, 'failed actions')
  for (const job of failed) {
    try {
      console.log(`[${job.id}] processing ${job.data.type}`)
      await handler(job.data)
      console.log(`[${job.id}] completed ${job.data.type}`)
      await job.remove()
    } catch (e) {
      console.error(`[${job.id}] failed with ${e}`)
    }
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => {
    process.exit(0)
  })
