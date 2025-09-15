/* Kanban Board - script.js
   Features:
   - Add/remove columns & cards
   - Drag & drop reorder & move (HTML5 DnD)
   - Touch fallback (pointer events)
   - Persistence to localStorage
   - Undo/Redo stack
   - Card modal for edit/delete
   - Search/filter
   - Export/Import JSON
*/

const STORAGE_KEY = "kanban.board.v1";

const boardEl = document.getElementById("board");
const addColBtn = document.getElementById("add-col-btn");
const searchInput = document.getElementById("search");
const exportBtn = document.getElementById("export-btn");
const importBtn = document.getElementById("import-btn");
const importFile = document.getElementById("import-file");
const undoBtn = document.getElementById("undo-btn");
const redoBtn = document.getElementById("redo-btn");

const modal = document.getElementById("modal");
const modalClose = document.getElementById("modal-close");
const cardTitleInput = document.getElementById("card-title");
const cardDescInput = document.getElementById("card-desc");
const saveCardBtn = document.getElementById("save-card");
const deleteCardBtn = document.getElementById("delete-card");
const modalTitle = document.getElementById("modal-title");

const colTmpl = document.getElementById("column-template").content;
const cardTmpl = document.getElementById("card-template").content;

let state = null; // {cols: [{id,title,cards:[{id,title,desc,created}]}]}
let history = [],
  future = [];
let dragging = { el: null, originColId: null, cardId: null };

function uid(prefix = "id") {
  return prefix + "-" + Math.random().toString(36).slice(2, 9);
}

/* ------------------ Persistence & History ------------------ */
function saveState(pushToHistory = true) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  if (pushToHistory) {
    history.push(JSON.stringify(state));
    if (history.length > 100) history.shift();
    future = [];
  }
  updateUndoRedoUI();
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      state = JSON.parse(raw);
      render();
      return;
    } catch (e) {
      /* fallthrough */
    }
  }
  // seed with example
  state = {
    cols: [
      {
        id: uid("col"),
        title: "Backlog",
        cards: [
          {
            id: uid("card"),
            title: "Plan project",
            desc: "Sketch features and MVP",
            created: Date.now(),
          },
          {
            id: uid("card"),
            title: "Design board",
            desc: "Create color & spacing system",
            created: Date.now(),
          },
        ],
      },
      {
        id: uid("col"),
        title: "In Progress",
        cards: [
          {
            id: uid("card"),
            title: "Build drag/drop",
            desc: "Implement HTML5 DnD & fallback",
            created: Date.now(),
          },
        ],
      },
      { id: uid("col"), title: "Done", cards: [] },
    ],
  };
  saveState(false);
  render();
}

function pushHistory() {
  history.push(JSON.stringify(state));
  if (history.length > 100) history.shift();
  future = [];
  updateUndoRedoUI();
}

function undo() {
  if (history.length <= 1) return;
  future.push(history.pop());
  const prev = history[history.length - 1];
  state = JSON.parse(prev);
  localStorage.setItem(STORAGE_KEY, prev);
  render();
  updateUndoRedoUI();
}
function redo() {
  if (!future.length) return;
  const next = future.pop();
  state = JSON.parse(next);
  history.push(next);
  localStorage.setItem(STORAGE_KEY, next);
  render();
  updateUndoRedoUI();
}
function updateUndoRedoUI() {
  undoBtn.disabled = history.length <= 1;
  redoBtn.disabled = future.length === 0;
}

/* ------------------ Render ------------------ */
function render() {
  boardEl.innerHTML = "";
  const q = searchInput.value.trim().toLowerCase();

  state.cols.forEach((col) => {
    const colNode = colTmpl.cloneNode(true);
    const section = colNode.querySelector(".column");
    section.dataset.colId = col.id;

    const titleEl = section.querySelector(".col-title");
    titleEl.textContent = col.title;
    titleEl.addEventListener("input", () => {
      col.title = titleEl.textContent.trim() || "Untitled";
      saveState();
    });

    const addCardBtn = section.querySelector(".add-card-btn");
    addCardBtn.addEventListener("click", () => {
      const newCard = {
        id: uid("card"),
        title: "New card",
        desc: "",
        created: Date.now(),
      };
      col.cards.unshift(newCard);
      pushHistory();
      saveState(false);
      render();
      openCardModal(newCard.id, col.id);
    });

    const remColBtn = section.querySelector(".remove-col-btn");
    remColBtn.addEventListener("click", () => {
      if (!confirm("Remove column and its cards?")) return;
      state.cols = state.cols.filter((c) => c.id !== col.id);
      pushHistory();
      saveState(false);
      render();
    });

    const list = section.querySelector(".card-list");

    // dragover / drop handlers on column
    section.addEventListener("dragover", (e) => {
      e.preventDefault();
      section.classList.add("drag-over");
      const placeholder = getOrCreatePlaceholder(list);
      // optional: compute before which card to insert placeholder via pointer position
    });
    section.addEventListener("dragleave", () =>
      section.classList.remove("drag-over")
    );
    section.addEventListener("drop", (e) => {
      e.preventDefault();
      section.classList.remove("drag-over");
      const payload = e.dataTransfer?.getData("text/plain");
      if (payload) {
        const { cardId, fromColId } = JSON.parse(payload);
        moveCard(cardId, fromColId, col.id, null); // append to top
      }
    });

    // render each card
    col.cards.forEach((card) => {
      // apply search filter
      if (q) {
        const match = (card.title + " " + (card.desc || ""))
          .toLowerCase()
          .includes(q);
        if (!match) return;
      }
      const c = cardTmpl.cloneNode(true);
      const cardEl = c.querySelector(".card");
      cardEl.dataset.cardId = card.id;
      cardEl.dataset.colId = col.id;
      cardEl.querySelector(".card-title").textContent = card.title;
      const metaDate = new Date(card.created).toLocaleString();
      c.querySelector(".card-meta").textContent = metaDate;

      // drag handlers
      cardEl.addEventListener("dragstart", (ev) => {
        dragging.el = cardEl;
        dragging.originColId = col.id;
        dragging.cardId = card.id;
        cardEl.classList.add("dragging");
        ev.dataTransfer.setData(
          "text/plain",
          JSON.stringify({ cardId: card.id, fromColId: col.id })
        );
        ev.dataTransfer.effectAllowed = "move";
      });
      cardEl.addEventListener("dragend", () => {
        cardEl.classList.remove("dragging");
        dragging = { el: null, originColId: null, cardId: null };
      });

      // click opens modal
      cardEl.addEventListener("click", () => openCardModal(card.id, col.id));

      // keyboard: Enter opens modal; Arrow keys to move?
      cardEl.addEventListener("keydown", (ev) => {
        if (ev.key === "Enter") {
          ev.preventDefault();
          openCardModal(card.id, col.id);
        }
        if (ev.key === "Delete") {
          ev.preventDefault();
          deleteCard(card.id, col.id);
        }
      });

      list.appendChild(c);
    });

    boardEl.appendChild(section);
  });
}

/* placeholder utility inside column */
function getOrCreatePlaceholder(listEl) {
  let placeholder = listEl.querySelector(".placeholder");
  if (!placeholder) {
    placeholder = document.createElement("div");
    placeholder.className = "placeholder";
    listEl.appendChild(placeholder);
  }
  return placeholder;
}

/* ------------------ Mutations ------------------ */
function findCardLocation(cardId) {
  for (const col of state.cols) {
    const idx = col.cards.findIndex((c) => c.id === cardId);
    if (idx !== -1)
      return { colId: col.id, index: idx, col, card: col.cards[idx] };
  }
  return null;
}

function moveCard(cardId, fromColId, toColId, toIndex) {
  if (fromColId === toColId && toIndex === null) return;
  const fromCol = state.cols.find((c) => c.id === fromColId);
  const toCol = state.cols.find((c) => c.id === toColId);
  if (!fromCol || !toCol) return;
  const idx = fromCol.cards.findIndex((c) => c.id === cardId);
  if (idx === -1) return;
  const [card] = fromCol.cards.splice(idx, 1);
  if (toIndex === null || toIndex === undefined) toCol.cards.unshift(card);
  else toCol.cards.splice(toIndex, 0, card);
  pushHistory();
  saveState(false);
  render();
}

/* add column */
addColBtn.addEventListener("click", () => {
  const col = { id: uid("col"), title: "New Column", cards: [] };
  state.cols.push(col);
  pushHistory();
  saveState(false);
  render();
});

/* card modal */
let activeCardContext = null; // {cardId, colId}
function openCardModal(cardId, colId) {
  const loc = findCardLocation(cardId);
  if (!loc) return;
  activeCardContext = { cardId, colId };
  modalTitle.textContent = "Edit Card";
  cardTitleInput.value = loc.card.title;
  cardDescInput.value = loc.card.desc || "";
  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");
  cardTitleInput.focus();
}

modalClose.addEventListener("click", closeModal);
function closeModal() {
  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");
  activeCardContext = null;
}

saveCardBtn.addEventListener("click", () => {
  if (!activeCardContext) return;
  const { cardId, colId } = activeCardContext;
  const loc = findCardLocation(cardId);
  if (!loc) return;
  loc.card.title = cardTitleInput.value.trim() || "Untitled";
  loc.card.desc = cardDescInput.value.trim();
  pushHistory();
  saveState(false);
  render();
  closeModal();
});

deleteCardBtn.addEventListener("click", () => {
  if (!activeCardContext) return;
  const { cardId, colId } = activeCardContext;
  if (!confirm("Delete this card?")) return;
  deleteCard(cardId, colId);
  closeModal();
});

function deleteCard(cardId, colId) {
  const col = state.cols.find((c) => c.id === colId);
  if (!col) return;
  col.cards = col.cards.filter((c) => c.id !== cardId);
  pushHistory();
  saveState(false);
  render();
}

/* convenient create card function (used on import) */
function createCardInCol(colId, title, desc = "") {
  const col = state.cols.find((c) => c.id === colId);
  if (!col) return null;
  const card = { id: uid("card"), title, desc, created: Date.now() };
  col.cards.unshift(card);
  return card;
}

/* ------------------ Search & Export/Import ------------------ */
searchInput.addEventListener("input", () => render());

exportBtn.addEventListener("click", () => {
  const data = JSON.stringify(state, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "kanban-board.json";
  a.click();
  URL.revokeObjectURL(url);
});

importBtn.addEventListener("click", () => importFile.click());
importFile.addEventListener("change", async (ev) => {
  const file = ev.target.files[0];
  if (!file) return;
  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    if (parsed && Array.isArray(parsed.cols)) {
      state = parsed;
      pushHistory();
      saveState(false);
      render();
      alert("Board imported");
    } else alert("Invalid board file");
  } catch (e) {
    alert("Failed to import");
  }
});

/* ------------------ Undo/Redo UI ------------------ */
undoBtn.addEventListener("click", undo);
redoBtn.addEventListener("click", redo);

/* ------------------ Utilities & Touch fallback ------------------ */

/* Touch/pointer fallback to allow dragging on touch devices: create "pick up" on pointerdown and move element under pointer,
   then detect target column under pointerup and move the card. This is a simple, robust fallback. */
let pointerDrag = null;

boardEl.addEventListener("pointerdown", (ev) => {
  const card = ev.target.closest(".card");
  if (!card) return;
  // only start if primary button/touch
  if (ev.isPrimary !== undefined && ev.isPrimary === false) return;
  pointerDrag = { startX: ev.clientX, startY: ev.clientY, node: card };
  card.setPointerCapture(ev.pointerId);
  card.classList.add("dragging");
  ev.preventDefault();
});

boardEl.addEventListener("pointermove", (ev) => {
  if (!pointerDrag) return;
  // basic threshold to avoid accidental movement
  const dx = Math.abs(ev.clientX - pointerDrag.startX);
  const dy = Math.abs(ev.clientY - pointerDrag.startY);
  if (dx + dy < 10) return;
  // visually follow the pointer by translating
  const n = pointerDrag.node;
  n.style.transform = `translate(${ev.clientX - pointerDrag.startX}px, ${
    ev.clientY - pointerDrag.startY
  }px)`;
});

boardEl.addEventListener("pointerup", (ev) => {
  if (!pointerDrag) return;
  const n = pointerDrag.node;
  n.style.transform = "";
  n.classList.remove("dragging");
  try {
    n.releasePointerCapture(ev.pointerId);
  } catch (e) {}
  // find column under pointer
  const dropTarget = document
    .elementFromPoint(ev.clientX, ev.clientY)
    ?.closest(".column");
  if (dropTarget) {
    const cardId = n.dataset.cardId;
    const fromColId = n.dataset.colId;
    const toColId = dropTarget.dataset.colId;
    if (cardId && fromColId && toColId) {
      moveCard(cardId, fromColId, toColId, null);
    }
  }
  pointerDrag = null;
});

/* keyboard shortcut: n => new card in first column */
document.addEventListener("keydown", (ev) => {
  if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === "z") {
    ev.preventDefault();
    undo();
  }
  if (
    (ev.ctrlKey || ev.metaKey) &&
    (ev.key.toLowerCase() === "y" ||
      (ev.shiftKey && ev.key.toLowerCase() === "z"))
  ) {
    ev.preventDefault();
    redo();
  }
});

/* ------------------ Initialization ------------------ */
loadState();
history.push(JSON.stringify(state));
updateUndoRedoUI();

/* Accessibility note: We avoid complex ARIA because HTML5 DnD + cards are native interactive elements.
   For production, consider additional ARIA live regions for movements and announcements on drag events.
*/
