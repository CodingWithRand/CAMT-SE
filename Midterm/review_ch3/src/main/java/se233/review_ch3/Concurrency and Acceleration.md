# Concurrency
The computer has evolved. It's a lot more powerful in the 90s 2000s. CPU nowadays has multicore. We should utilize that resource to the fullest to increase the program performance. Make it run fast. Especially in the GUI context, the response after user interaction (event) should be immediate, or explicitly tell user to wait on that interaction in case it takes the program a while to complete the execution.

To maximize the CPU core utilization, we do **multithreading** and **multiprocessing**

## Case study: Why multithreading/multiprocessing?
In the normal synchronous single-thread program flow, each line of code run one by one. The line below wait for the line above to finish executing. But if we apply that to the GUI context...

For example, there are 2 buttons, both do its own thing. When user clicks on one of the buttons, the program execute that button's function, then immediately after the user click on another button, but that function is still not finished executing, so the program do nothing because that unfinish execution blocks new user interaction to go through. User don't see any change on the program, they may click multiple time, expect change to occur. It will only when the execution of the other button is finished.

From the case study, it is **not responsive** at all for the program to act like that. Unacceptable for an GUI program to be unresponsive. We must make it **responsive**!

There is a workaround for this. Instead of all the code handle by a single thread, single pipe. We offload the heavy work that takes a lot of time to process like downloading files, heavy computation, etc. Offload it to another thread/process. Make a dedicate thread for the GUI, which is...

- **EDT (Event Dispatcher Thread)** will handle every user interaction, UI event.
- **Event Listener Thread(s)**, which is a part of **EDT** (although separate thread) will handle an **Event Handler** function in each event listener.

EDT will remain free to accept new user interaction/events, while event listener threads do the event handlers execution in the background.

## Multithread
Think of it like multiple worker in a room working on a project. A worker in there is a "Thread", while the room is a "Process". When doing the work, they use resource in that room to do the work. They communicate, sharing thoughts, opinions which contribute to the project completion, but there is a time when conflicts happen too. All within that room.
- "Lightweight concurrency" in a process.
- Resource sharing, in the same memory address.
- Good synchronization is required to prevent data loss/corruption, and ensure the output is correct.
- Faster than multiprocess (disregard synchronization for now.)
## Multiprocess
As mentioned that a room is a process. Then, multiprocess would be multiple room of worker working on different project, each room has different resource. To communicate between room, you'd come out of the room, and go into another room to tell them on the face.
- "Heavy-weight parallelism" in separate processes.
- Independent resource, the work is carried in different memory address.
- Actually, it's 1 process = 1 CPU core
- To synchronize you need inter-process communication (IPC)
- Slower than multithread, but only by a little nowadays as the CPU cores are so fast. You may want to choose multiprocess rather than multithread as it's less prone to error.
## Synchronization
As stated in [Multithread](#multithread), synchronization is required to ensure the output is correct. Imagine workers perform tasks in different timeframe without any proper schedule or rule. They may do it whenever they want. Some tasks may require output from another task. But while the worker is using that output value, another worker has made a change to that value, and it's not updated to everyone. So, that guy is working on the task with incorrect value now, making the output incorrect as well.

Example: 2 workers withdraw \$100 at the same time when balance is \$500. The remaining balance is supposed to be \$300 after the withdrawal.

| Task              | Worker 1 | Worker 2 |
|-------------------|----------|----------|
| Retrieved balance | 500      | 500      |
| Withdraw          | 100      | 100      |
| Remaining balance | 400      | 400      |

The result is, remaining balance is \$400, which is WRONG!!!!

So, that's why we need Synchronization, here are the concepts that we use.
1. **Consistent State**: Only allow certain threads to use the resource at a time check from its state.
2. **Visibility of Changes**: When synchronized, allow every thread to see the most up-to-date changes made.

In terms of accuracy/correctness, it's better to synchronize multiple time, but don't forget that there is "overhead".

Synchronize too many times and the program will be slow again (bottleneck), or maybe even halting the program (deadlocks), as the thread needs to wait for other threads.

However, synchronize too few and the program may have a chance to give you incorrect output as the change the thread made is not visible to other threads. And also, when the order of thread execution is not set, the output will be unpredictable. Which output will the program output from which thread? Which thread finish first? (Race condition)

So, balance it. Apply 2 concepts above and
- Allow one thread to use the resource at a time
- Set the order of thread execution
## Embarrassingly parallelizable computation
Basically do multithreading/multiprocessing without synchronization. (maybe once at the end.) Work well for the task that can be easily break into small *independent* tasks, data is easily partition too. We can achieve maxmimum parallelism this way.

# Concurrency in Java
Use `javafx.concurrent` package and `java.util.concurrent`

1. `Worker` interface and `Task`, `Service`, `ScheduledService`, and `WorkerState` classes.
2. `Task`, `Service`, and `ScheduledService` run code in the background.
3. `WorkerState` is an enum represents the state of the `Worker` about the task progress and completion.
4. `Service` is reusable `Task`. It can be reset (manually tho.)
5. `ScheduledService` is `Service` but can be automatically reset and reused with the configuration.

The rest is in the code file now.
1. [MainController](./new_multi/MainController.java)
2. [Downloader](./new_multi/Downloader.java)

This example program will split a download task into 2 thread, break the file in half into 2 chunks, then merge them together.
Try downloading this: https://naoezvmpzuwzafoeguvh.supabase.co/storage/v1/object/public/public-assets/python.mp4

# Extra
Suppose a task takes $O(n^3)$ operations. Running on these computation component will achieve the following execution time

|                         | 1 core CPU | Multicore CPU      | GPU                           |
|-------------------------|------------|--------------------|-------------------------------|
| Process unit            | 1          | 1D Array (n units) | 2D Array ($n \times m$ units) |
| Compute time complexity | $O(n^3)$   | $O(n^2)$           | $O(n)$                        |
| Reduce time             | None       | $O(n)$             | $O(n^2)$                      |