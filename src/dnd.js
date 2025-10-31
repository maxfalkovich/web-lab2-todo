export function attachDnD(listEl, options) {
  let draggedLi = null;

  function enabled() {
    try { return !!options.enabled(); } catch { return false; }
  }

  listEl.addEventListener('dragstart', (e) => {
    if (!enabled()) { e.preventDefault(); return; }
    const handle = e.target.closest('.todo-item__handle');
    if (!handle) { e.preventDefault(); return; }

    const li = handle.closest('li[data-id]');
    if (!li) { e.preventDefault(); return; }
    draggedLi = li;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', li.dataset.id);
    li.classList.add('dragging');
  });

  listEl.addEventListener('dragend', () => {
    draggedLi?.classList.remove('dragging');
    draggedLi = null;
  });

  listEl.addEventListener('dragenter', (e) => {
    if (!enabled()) return;
    e.preventDefault();
  });

  listEl.addEventListener('dragover', (e) => {
    if (!enabled()) return;
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
  });

  listEl.addEventListener('drop', (e) => {
    if (!enabled()) return;
    e.preventDefault();
    if (!draggedLi) return;

    const beforeEl = getElementBeforeY(listEl, e.clientY);
    if (beforeEl == null) {
      listEl.appendChild(draggedLi);
    } else {
      listEl.insertBefore(draggedLi, beforeEl);
    }

    const order = Array.from(listEl.querySelectorAll('li[data-id]'))
      .map(li => li.dataset.id);

    options.onReorder?.(order);

    draggedLi.classList.remove('dragging');
    draggedLi = null;
  });

  function getElementBeforeY(container, mouseY) {
    const items = [...container.querySelectorAll('li[data-id]:not(.dragging)')];
    let candidate = null;

    for (const el of items) {
      const rect = el.getBoundingClientRect();
      const middle = rect.top + rect.height / 2;
      if (mouseY < middle) {
        candidate = el;
        break;
      }
    }
    return candidate;
  }
}
