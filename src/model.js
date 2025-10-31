import { uuid } from './dom.js';

export class TaskStore {
  constructor(initialTasks = []) {
    this.tasks = Array.isArray(initialTasks) ? initialTasks.slice() : [];
    if (this.tasks.length) this._normalizeOrder();
  }

  _normalizeOrder() {
    this.tasks.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    this.tasks.forEach((t, i) => { t.order = i + 1; });
  }

  add(title, dueISO) {
    const now = Date.now();
    const order = (this.tasks[this.tasks.length - 1]?.order ?? 0) + 1;
    const task = {
      id: uuid(),
      title: String(title).trim(),
      due: dueISO || null,
      completed: false,
      createdAt: now,
      updatedAt: now,
      order
    };
    this.tasks.push(task);
    return task;
  }

  update(id, patch) {
    const t = this.tasks.find(x => x.id === id);
    if (!t) return null;
    if (patch.title != null) t.title = String(patch.title).trim();
    if (patch.due !== undefined) t.due = patch.due || null;
    if (patch.completed != null) t.completed = !!patch.completed;
    t.updatedAt = Date.now();
    return t;
  }

  toggle(id, completed) {
    return this.update(id, { completed: completed != null ? !!completed : undefined, completed2: null });
  }

  remove(id) {
    const idx = this.tasks.findIndex(x => x.id === id);
    if (idx >= 0) this.tasks.splice(idx, 1);
  }

  reorderByIdList(idList) {
    const idPos = new Map(idList.map((id, i) => [id, i]));
    this.tasks.sort((a, b) => {
      const pa = idPos.has(a.id) ? idPos.get(a.id) : Number.MAX_SAFE_INTEGER;
      const pb = idPos.has(b.id) ? idPos.get(b.id) : Number.MAX_SAFE_INTEGER;
      return pa - pb;
    });
    this._normalizeOrder();
  }

  query(view) {
    const { filter = 'all', sort = 'none', q = '' } = view || {};
    const needle = q.trim().toLowerCase();

    let arr = this.tasks.slice();

    // фильтр по статусу
    if (filter === 'active') arr = arr.filter(t => !t.completed);
    else if (filter === 'completed') arr = arr.filter(t => t.completed);

    // поиск по названию
    if (needle) arr = arr.filter(t => t.title.toLowerCase().includes(needle));

    // сортировка
    if (sort === 'none') {
      arr.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    } else if (sort === 'date-asc' || sort === 'date-desc') {
      const dir = sort === 'date-asc' ? 1 : -1;
      arr.sort((a, b) => {
        const ad = a.due ? a.due : '9999-12-31';
        const bd = b.due ? b.due : '9999-12-31';
        if (ad === bd) return (a.order ?? 0) - (b.order ?? 0);
        return ad > bd ? dir : -dir;
      });
    }
    return arr;
  }
}
