export interface Task {
  id: number;
  title: string;
  done: boolean;
}

// In-memory store
let tasks: Task[] = [
  { id: 1, title: "Understand CI Stages", done: false },
  { id: 2, title: "Fix the Failing Test", done: false },
  { id: 3, title: "Review the Dockerfile", done: true },
];
let nextId = 4;

export const getTasks = (): Task[] => tasks;

/**
 * Adds a new task.
 *
 * INTENTIONAL BUG: This function does not trim whitespace from the title.
 * A title with only spaces ("   ") is considered valid, but the test expects
 * it to be rejected. This is the bug for "Lab 1" in the README.
 */
export const addTask = (title: string): Task | null => {
  // BUG is here: does not use .trim()
  if (!title) {
    return null; // Reject empty titles
  }
  const newTask: Task = {
    id: nextId++,
    title: title,
    done: false,
  };
  tasks.push(newTask);
  return newTask;
};

export const toggleTask = (id: number): Task | null => {
  const task = tasks.find((t) => t.id === id);
  if (task) {
    task.done = !task.done;
    return task;
  }
  return null;
};

export const deleteTask = (id: number): boolean => {
  // uncomment the code below to make this function works -->

  // const taskIndex = tasks.findIndex((t) => t.id === id);
  // if (taskIndex > -1) {
  //   tasks.splice(taskIndex, 1);
  //   return true;
  // }

  return false;
};

// Function to reset tasks, useful for testing
export const resetTasks = () => {
  tasks = [
    { id: 1, title: "Understand CI Stages", done: false },
    { id: 2, title: "Fix the Failing Test", done: false },
    { id: 3, title: "Review the Dockerfile", done: true },
  ];
  nextId = 4;
};
