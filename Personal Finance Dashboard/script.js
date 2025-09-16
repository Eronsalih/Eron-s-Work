const form = document.getElementById("transaction-form");
const list = document.getElementById("transaction-list");
const incomeDisplay = document.getElementById("income");
const expenseDisplay = document.getElementById("expense");
const balanceDisplay = document.getElementById("balance");

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

function updateDashboard() {
  let income = 0;
  let expense = 0;

  list.innerHTML = "";

  transactions.forEach((t, index) => {
    const li = document.createElement("li");
    li.classList.add(t.type);
    li.innerHTML = `
      <span>${t.date} - ${t.description}</span>
      <span>${t.type === "income" ? "+" : "-"}${t.amount} €</span>
      <button onclick="deleteTransaction(${index})">❌</button>
    `;
    list.appendChild(li);

    if (t.type === "income") income += t.amount;
    else expense += t.amount;
  });

  incomeDisplay.textContent = income;
  expenseDisplay.textContent = expense;
  balanceDisplay.textContent = income - expense;

  localStorage.setItem("transactions", JSON.stringify(transactions));
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const description = document.getElementById("description").value;
  const amount = parseFloat(document.getElementById("amount").value);
  const type = document.getElementById("type").value;
  const date = document.getElementById("date").value;

  if (!description || isNaN(amount) || !date) return;

  const transaction = { description, amount, type, date };
  transactions.push(transaction);
  form.reset();
  updateDashboard();
});

function deleteTransaction(index) {
  transactions.splice(index, 1);
  updateDashboard();
}

updateDashboard();
