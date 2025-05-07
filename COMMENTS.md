## Explanation
- In the initial version of the code, multiple workers could retrieve and process the 
  same message when dequeuing in parallel. This occurred because messages were immediately 
  removed from the queue without any confirmation of processing. 
- Typically, when dequeuing a message from a queue, the message remains in the queue 
  until it is explicitly acknowledged as successfully processed.
- With this new implementation, when a message is dequeued, it is returned without being
  removed from the map. It remains available until it is explicitly acknowledged. 
  A separate data structure is added to track which messages are currently 
  being processed and by which workers. This will ensure that a message is not delivered to
  multiple workers simultaneously, each worker can be uniquely associated with a message it 
  is processing, and that only the assigned worker can acknowledge (confirm) a message.

## A Few Possible Suggestions
1. Add retry logic for workers - currently workers exit if the queue returns no available message. 
   The problem is there could still be messages locked by other workers (that might not be acked eventually) 
   which would lead to Queue.Dequeu() returning undefined to Worker.Work(). To solve this we could add 
   continue instead of break in the while loop in .Work(), and add idle count on e.g. 50 retries before 
   shutting down the worker.
2. Add timestamp to locked message (something similar to AWS visibility timeout mechanism) so that if worker goes 
   down and message is locked but not acked, after some time it gets unlocked automatically.
3. Add transaction on this.mesaages.delete() + this.processing.delete() 
4. Add logging to get better visibility into what's happening (which worker did what, when, with which message, etc)


