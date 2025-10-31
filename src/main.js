import { buildApp } from './ui.js';
import { TaskStore } from './model.js';
import { loadTasks, saveTasks, loadView, saveView } from './storage.js';

(function attachStyles() {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = './src/styles.css';
  document.head.appendChild(link);
})();

const store = new TaskStore(loadTasks());
function persistTasks() { saveTasks(store.tasks); }

const initialView = loadView();

const app = buildApp(document.body, initialView, {
  getVisible(view) { return store.query(view); },
  peekAllCount() { return store.tasks.length; },
  peekActiveCount() { return store.tasks.filter(t => !t.completed).length; },

  onAdd({ title, due }) {
    store.add(title, due);
    persistTasks();
    rerender();
  },

  onDelete(id) {
    store.remove(id);
    persistTasks();
    rerender();
  },

  onEdit(id, patch) {
    store.update(id, patch);
    persistTasks();
    rerender();
  },

  onToggle(id, checked) {
    store.update(id, { completed: !!checked });
    persistTasks();
    rerender();
  },

  onReorder(idOrder) {
    store.reorderByIdList(idOrder);
    persistTasks();
    rerender();
  },

  onViewChange({ filter, sort }) {
    saveView({ filter, sort });
    rerender();
  }
});

function rerender() {
  const view = app.getView();
  app.update(store.query(view));
}
