import { el, clear, isoToRu } from './dom.js';
import { attachDnD } from './dnd.js';

export function buildApp(root, initialView, handlers) {
  const state = {
    view: {
      filter: initialView?.filter || 'all',
      sort: initialView?.sort || 'none',
      q: '' // поиск не сохраняем
    }
  };

  // Header
  const h1 = el('h1', { className: 'title', text: 'Задачи' });

  // Панель добавления
  const addTitle = el('input', {
    type: 'text',
    placeholder: 'Название задачи',
    required: true,
    className: 'input'
  });
  const addDate = el('input', {
    type: 'date',
    className: 'input input--date',
  });
  const addBtn = el('button', { type: 'submit', className: 'btn btn--primary', text: 'Добавить' });

  const addForm = el('form', { className: 'add-form' }, [addTitle, addDate, addBtn]);

  // Управление списком
  const filterSel = el('select', { className: 'select js-filter' }, [
    el('option', { value: 'all', text: 'Все' }),
    el('option', { value: 'active', text: 'Активные' }),
    el('option', { value: 'completed', text: 'Выполненные' }),
  ]);

  const sortSel = el('select', { className: 'select js-sort' }, [
    el('option', { value: 'none', text: 'Без сортировки' }),
    el('option', { value: 'date-asc', text: 'Дата ↑' }),
    el('option', { value: 'date-desc', text: 'Дата ↓' }),
  ]);

  const searchInput = el('input', {
    type: 'search',
    placeholder: 'Поиск по названию…',
    className: 'input input--search'
  });

  const stats = el('div', { className: 'stats' });

  const controls = el('div', { className: 'controls' }, [
    el('div', { className: 'controls__group' }, [el('label', { for: 'filter', text: 'Фильтр:' }), filterSel]),
    el('div', { className: 'controls__group' }, [el('label', { for: 'sort', text: 'Сортировка:' }), sortSel]),
    el('div', { className: 'controls__group controls__group--grow' }, [searchInput]),
    stats
  ]);

  // Список задач
  const list = el('ul', { className: 'todo__list', role: 'list' });

  // Компоновка
  const container = el('div', { className: 'container' }, [
    el('header', { className: 'header' }, h1),
    el('section', { className: 'section' }, addForm),
    el('section', { className: 'section' }, controls),
    el('main', { className: 'main' }, list),
  ]);

  root.appendChild(container);

  // DnD
  attachDnD(list, {
    enabled: () => state.view.sort === 'none',
    onReorder: (idOrder) => handlers.onReorder(idOrder)
  });

  // Обработчики формы добавления
  addForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = addTitle.value.trim();
    const due = addDate.value ? addDate.value : null;
    if (!title) return;
    handlers.onAdd({ title, due });
    addTitle.value = '';
    addDate.value = '';
  });

  // Управление видами
  filterSel.addEventListener('change', () => {
    state.view.filter = filterSel.value;
    handlers.onViewChange({ filter: state.view.filter, sort: state.view.sort });
  });

  sortSel.addEventListener('change', () => {
    state.view.sort = sortSel.value;
    handlers.onViewChange({ filter: state.view.filter, sort: state.view.sort });
  });

  function requestDataAndUpdate() {
    const base = handlers.getVisible(state.view);
    update(base);
  }

  searchInput.addEventListener('input', () => {
    state.view.q = searchInput.value || '';
    requestDataAndUpdate();
  });

  // Делегирование событий списка
  list.addEventListener('click', (e) => {
    const li = e.target.closest('li[data-id]');
    if (!li) return;
    const id = li.dataset.id;

    if (e.target.closest('.js-delete')) {
      handlers.onDelete(id);
      return;
    }
    if (e.target.closest('.js-edit')) {
      li.classList.add('is-editing');
      const input = li.querySelector('.edit__title');
      if (input) { input.value = input.value; input.focus(); }
      return;
    }
    if (e.target.closest('.js-save')) {
      const title = li.querySelector('.edit__title')?.value?.trim() || '';
      const dueInput = li.querySelector('.edit__date');
      const due = dueInput?.value ? dueInput.value : null;
      if (!title) return;
      handlers.onEdit(id, { title, due });
      li.classList.remove('is-editing');
      return;
    }
  });

  // Смена статуса выполнено/не выполнено
  list.addEventListener('change', (e) => {
    const cb = e.target.closest('input[type="checkbox"].js-toggle');
    if (!cb) return;
    const li = cb.closest('li[data-id]');
    if (!li) return;
    handlers.onToggle(li.dataset.id, cb.checked);
  });

  // Сохранение по Enter в режиме редактирования
  list.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    const li = e.target.closest('li.is-editing[data-id]');
    if (!li) return;
    e.preventDefault();
    const title = li.querySelector('.edit__title')?.value?.trim() || '';
    const dueInput = li.querySelector('.edit__date');
    const due = dueInput?.value ? dueInput.value : null;
    if (!title) return;
    handlers.onEdit(li.dataset.id, { title, due });
    li.classList.remove('is-editing');
  });

  // Рендер одной задачи
  function renderItem(task, dragEnabled) {
    const li = el('li', {
      className: `todo-item${task.completed ? ' todo-item--done' : ''}`,
      dataset: { id: task.id }
    });

    // View mode
    const toggle = el('input', { type: 'checkbox', className: 'checkbox js-toggle', checked: task.completed, title: 'Готово' });
    const title = el('span', { className: 'todo-item__title', text: task.title });

    const dateText = task.due ? isoToRu(task.due) : '';
    const dateEl = el('time', { className: 'todo-item__date', datetime: task.due || '', text: dateText });

    const handle = el('span', { className: 'todo-item__handle', title: dragEnabled ? 'Перетащите для изменения порядка' : 'DnD доступен только при «Без сортировки»' });

    const editBtn = el('button', { className: 'btn btn--ghost js-edit', type: 'button', text: 'Редактировать' });
    const delBtn  = el('button', { className: 'btn btn--danger js-delete', type: 'button', text: 'Удалить' });

    const viewRow = el('div', { className: 'todo-item__row' }, [
      handle, toggle, title, dateEl,
      el('div', { className: 'spacer' }),
      editBtn, delBtn
    ]);

    // Edit mode
    const editTitle = el('input', { type: 'text', className: 'input edit__title', value: task.title });
    const editDate  = el('input', { type: 'date', className: 'input input--date edit__date', value: task.due || '' });
    const saveBtn   = el('button', { className: 'btn btn--primary js-save', type: 'button', text: 'Сохранить' });

    const editRow = el('div', { className: 'todo-item__edit' }, [
      editTitle, editDate,
      el('div', { className: 'spacer' }),
      saveBtn
    ]);

    li.appendChild(viewRow);
    li.appendChild(editRow);

    // DnD доступен только при sort === 'none'
    li.draggable = !!dragEnabled;

    return li;
  }

  // Публичный render
  function render(data = []) {
    // обновляем селекты/поиск
    filterSel.value = state.view.filter;
    sortSel.value = state.view.sort;

    // счётчики
    const totalBase = handlers.getVisible(state.view);
    const total = totalBase.length;
    const active = handlers.peekActiveCount?.() ?? 0;
    stats.textContent = `Всего: ${total} · Активных: ${active}`;

    clear(list);
    const dragEnabled = state.view.sort === 'none';
    for (const t of data) list.appendChild(renderItem(t, dragEnabled));
  }

  // метод для внешнего обновления
  function update(dataArray) {
    // применяем поиск только на уровне UI
    const q = (state.view.q || '').trim().toLowerCase();
    const filtered = q ? dataArray.filter(t => t.title.toLowerCase().includes(q)) : dataArray;
    render(filtered);
  }

  // первичная инициализация
  requestDataAndUpdate();

  return {
    state,
    refs: { list, filterSel, sortSel, searchInput },
    update,
    getView: () => ({ ...state.view })
  };
}
