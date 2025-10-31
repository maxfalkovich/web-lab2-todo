export function attachDnD(listEl, options) {
  let draggedId = null;

  function enabled() {
    try { return !!options.enabled(); } catch { return false; }
  }

  listEl.addEventListener('dragstart', (e) => {
    if (!enabled()) { e.preventDefault(); return; }
    const li = e.target.closest('li[data-id]');
    if (!li) { e.preventDefault(); return; }
    draggedId = li.dataset.id;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', draggedId);
    li.classList.add('dragging');
  });

  listEl.addEventListener('dragend', (e) => {
    const li = e.target.closest('li[data-id]');
    if (li) li.classList.remove('dragging');
    draggedId = null;
  });

  listEl.addEventListener('dragover', (e) => {
    if (!enabled()) return;
    e.preventDefault();
  });

  listEl.addEventListener('drop', (e) => {
    if (!enabled()) return;
    e.preventDefault();

    if (!draggedId) return;
    const all = Array.from(listEl.querySelectorAll('li[data-id]'));
    let order = all.map(li => li.dataset.id).filter(id => id !== draggedId);

    const targetLi = e.target.closest('li[data-id]');
    if (!targetLi) {
      order.push(draggedId);
    } else {
      const targetId = targetLi.dataset.id;
      if (targetId === draggedId) return;
      const rect = targetLi.getBoundingClientRect();
      const before = (e.clientY - rect.top) < rect.height / 2;
      const idx = order.indexOf(targetId);
      order.splice(before ? idx : idx + 1, 0, draggedId);
    }

    if (typeof options.onReorder === 'function') {
      options.onReorder(order);
    }
    draggedId = null;
  });
}
