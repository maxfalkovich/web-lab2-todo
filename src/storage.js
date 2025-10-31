const TASKS_KEY = 'todo:v1';
const VIEW_KEY  = 'todo:view:v1';

export function loadTasks() {
  try {
    const raw = localStorage.getItem(TASKS_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    if (Array.isArray(data?.tasks)) return data.tasks;
  } catch {}
  return [];
}

export function saveTasks(tasks) {
  try {
    const payload = { version: 1, tasks: tasks || [] };
    localStorage.setItem(TASKS_KEY, JSON.stringify(payload));
  } catch {}
}

export function loadView() {
  const def = { filter: 'all', sort: 'none' };
  try {
    const raw = localStorage.getItem(VIEW_KEY);
    if (!raw) return def;
    const data = JSON.parse(raw);
    return {
      filter: data?.filter === 'active' || data?.filter === 'completed' ? data.filter : 'all',
      sort: data?.sort === 'date-asc' || data?.sort === 'date-desc' ? data.sort : 'none'
    };
  } catch { return def; }
}

export function saveView(view) {
  try {
    const payload = { version: 1, filter: view.filter, sort: view.sort };
    localStorage.setItem(VIEW_KEY, JSON.stringify(payload));
  } catch {}
}
