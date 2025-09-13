// Initialization & Variables
const form = document.getElementById("expense-form");
const expenseListEl = document.getElementById("expense-list");
const totalBalanceEl = document.getElementById("total-balance");
const categoryBreakdownEl = document.getElementById("category-breakdown");
const filterCategoryEl = document.getElementById("filter-category");
const filterStartDateEl = document.getElementById("filter-start-date");
const filterEndDateEl = document.getElementById("filter-end-date");
const clearFiltersBtn = document.getElementById("clear-filters");
const expenseChartCtx = document
  .getElementById("expense-chart")
  .getContext("2d");

// Categories & Colors
const categories = {
  food: {
    label: "Food",
    colorClass: "category-food",
    color: getComputedStyle(document.documentElement)
      .getPropertyValue("--color-food")
      .trim(),
  },
  transport: {
    label: "Transport",
    colorClass: "category-transport",
    color: getComputedStyle(document.documentElement)
      .getPropertyValue("--color-transport")
      .trim(),
  },
  entertainment: {
    label: "Entertainment",
    colorClass: "category-entertainment",
    color: getComputedStyle(document.documentElement)
      .getPropertyValue("--color-entertainment")
      .trim(),
  },
  bills: {
    label: "Bills",
    colorClass: "category-bills",
    color: getComputedStyle(document.documentElement)
      .getPropertyValue("--color-bills")
      .trim(),
  },
  other: {
    label: "Other",
    colorClass: "category-other",
    color: getComputedStyle(document.documentElement)
      .getPropertyValue("--color-other")
      .trim(),
  },
};

// Load today's date max for input date
const today = new Date().toISOString().split("T")[0];
document.getElementById("date").setAttribute("max", today);

// State
let expenses = JSON.parse(localStorage.getItem("expenses")) || [];

// Chart Instance
let expenseChart;

// Functions
function saveExpenses() {
  localStorage.setItem("expenses", JSON.stringify(expenses));
}

function addExpense(expense) {
  expenses.push(expense);
  saveExpenses();
  renderExpenses();
}

function formatDate(dateStr) {
  const options = { year: "numeric", month: "short", day: "numeric" };
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, options);
}

function clearForm() {
  form.reset();
  form.querySelector("#category").selectedIndex = 0;
  form.querySelector("#date").max = today;
}

function filterExpenses() {
  let filtered = [...expenses];
  const category = filterCategoryEl.value;
  const startDate = filterStartDateEl.value;
  const endDate = filterEndDateEl.value;

  if (category && category !== "all") {
    filtered = filtered.filter((exp) => exp.category === category);
  }
  if (startDate) {
    filtered = filtered.filter(
      (exp) => new Date(exp.date) >= new Date(startDate)
    );
  }
  if (endDate) {
    filtered = filtered.filter(
      (exp) => new Date(exp.date) <= new Date(endDate)
    );
  }
  return filtered;
}

function renderExpenses() {
  const filteredExpenses = filterExpenses();

  // Clear list
  expenseListEl.innerHTML = "<h2>Expenses</h2>";

  if (filteredExpenses.length === 0) {
    expenseListEl.insertAdjacentHTML(
      "beforeend",
      `<div style="text-align:center; color:#777; margin-top:2rem;">No expenses found.</div>`
    );
    renderSummary(filteredExpenses);
    updateChart(filteredExpenses);
    return;
  }

  // Render each expense
  filteredExpenses.forEach((exp) => {
    const item = document.createElement("div");
    item.className = "expense-item";

    item.innerHTML = `
        <div class="expense-amount">$${parseFloat(exp.amount).toFixed(2)}</div>
        <div class="expense-desc">${exp.description || "-"}</div>
        <div class="expense-category ${categories[exp.category].colorClass}">${
      categories[exp.category].label
    }</div>
        <div class="expense-date">${formatDate(exp.date)}</div>
        <button aria-label="Delete Expense" title="Delete" style="background:none; border:none; color:#dc3545; font-weight:700; cursor:pointer;">&times;</button>
      `;

    // Delete button handler
    item.querySelector("button").addEventListener("click", () => {
      if (confirm("Delete this expense?")) {
        expenses = expenses.filter((e) => e.id !== exp.id);
        saveExpenses();
        renderExpenses();
      }
    });

    expenseListEl.appendChild(item);
  });

  renderSummary(filteredExpenses);
  updateChart(filteredExpenses);
}

function renderSummary(filteredExpenses) {
  const total = filteredExpenses.reduce(
    (sum, e) => sum + parseFloat(e.amount),
    0
  );
  totalBalanceEl.textContent = `$${total.toFixed(2)}`;

  // Category breakdown
  const breakdown = {};
  Object.keys(categories).forEach((cat) => (breakdown[cat] = 0));
  filteredExpenses.forEach((e) => {
    breakdown[e.category] += parseFloat(e.amount);
  });

  categoryBreakdownEl.innerHTML = "";
  Object.entries(breakdown).forEach(([cat, amount]) => {
    if (amount > 0) {
      const div = document.createElement("div");
      div.textContent = `${categories[cat].label}: $${amount.toFixed(2)}`;
      div.style.backgroundColor = categories[cat].color;
      categoryBreakdownEl.appendChild(div);
    }
  });
}

function updateChart(filteredExpenses) {
  // Group data by category
  const dataMap = {};
  Object.keys(categories).forEach((cat) => (dataMap[cat] = 0));
  filteredExpenses.forEach((e) => {
    dataMap[e.category] += parseFloat(e.amount);
  });

  const chartLabels = [];
  const chartData = [];
  const chartColors = [];

  Object.entries(dataMap).forEach(([cat, amount]) => {
    if (amount > 0) {
      chartLabels.push(categories[cat].label);
      chartData.push(amount);
      chartColors.push(categories[cat].color);
    }
  });

  if (expenseChart) expenseChart.destroy();

  expenseChart = new Chart(expenseChartCtx, {
    type: "pie",
    data: {
      labels: chartLabels,
      datasets: [
        {
          data: chartData,
          backgroundColor: chartColors,
          borderWidth: 1,
          borderColor: "#fff",
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: "bottom" },
        tooltip: { enabled: true },
      },
    },
  });
}

// Generate a unique ID for each expense
function generateID() {
  return "_" + Math.random().toString(36).substr(2, 9);
}

// Form submit
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const amount = parseFloat(form.amount.value);
  const category = form.category.value;
  const description = form.description.value.trim();
  const date = form.date.value;

  if (!amount || amount <= 0 || !category || !date) {
    alert("Please fill in all required fields with valid values.");
    return;
  }

  addExpense({ id: generateID(), amount, category, description, date });
  clearForm();
});

// Filters events
filterCategoryEl.addEventListener("change", renderExpenses);
filterStartDateEl.addEventListener("change", renderExpenses);
filterEndDateEl.addEventListener("change", renderExpenses);
clearFiltersBtn.addEventListener("click", () => {
  filterCategoryEl.value = "all";
  filterStartDateEl.value = "";
  filterEndDateEl.value = "";
  renderExpenses();
});

// Initial render
renderExpenses();
