let originalData = [];
let barChart, pieChart, lineChart;

// Fetch and process the CSV file on window load
window.onload = function () {
  fetch("/data/Fake_Sales_Data.csv")
    .then((response) => response.text())
    .then((csvText) => {
      processData(csvText);
    })
    .catch((error) => console.error("Error fetching the CSV file:", error));
};

function processData(csvText) {
  Papa.parse(csvText, {
    header: true,
    dynamicTyping: true,
    complete: function (results) {
      originalData = results.data;
      updateCharts(originalData);
      updateSummaryCards(originalData);
      populateDataTable(originalData);
    },
  });
}

function updateCharts(data) {
  if (barChart) barChart.destroy();
  if (pieChart) pieChart.destroy();
  if (lineChart) lineChart.destroy();

  createBarChart(data);
  createPieChart(data);
  createLineChart(data);
}

function createBarChart(data) {
  // Example: Summarize sales by product
  const salesByProduct = data.reduce((acc, curr) => {
    acc[curr.Product] = (acc[curr.Product] || 0) + curr.Sales;
    return acc;
  }, {});

  const ctx = document.getElementById("barChart").getContext("2d");
  barChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: Object.keys(salesByProduct),
      datasets: [
        {
          label: "Sales by Product",
          data: Object.values(salesByProduct),
          backgroundColor: [
            "rgba(255, 99, 132, 0.7)",
            "rgba(54, 162, 235, 0.7)",
            "rgba(255, 206, 86, 0.7)",
            "rgba(75, 192, 192, 0.7)",
          ],
          borderColor: "rgba(0, 123, 255, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
}

function createPieChart(data) {
  // Example: Sales distribution by region
  const salesByRegion = data.reduce((acc, curr) => {
    acc[curr.Region] = (acc[curr.Region] || 0) + curr.Sales;
    return acc;
  }, {});

  const ctx = document.getElementById("pieChart").getContext("2d");
  pieChart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: Object.keys(salesByRegion),
      datasets: [
        {
          label: "Sales by Region",
          data: Object.values(salesByRegion),
          backgroundColor: [
            "rgba(255, 99, 132, 0.7)",
            "rgba(54, 162, 235, 0.7)",
            "rgba(255, 206, 86, 0.7)",
            "rgba(75, 192, 192, 0.7)",
          ],
        },
      ],
    },
  });
}

function createLineChart(data) {
  // Group sales by month
  const salesByMonth = {};
  data.forEach((item) => {
    const month = item.Date.split("-")[1]; // Adjust this according to your date format
    salesByMonth[month] = (salesByMonth[month] || 0) + item.Sales;
  });

  // Prepare the data for the line chart
  const chartData = {
    labels: Object.keys(salesByMonth).sort(),
    datasets: [
      {
        label: "Monthly Sales",
        data: Object.values(salesByMonth),
        fill: false,
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
    ],
  };

  // Get the context of the canvas element
  const ctx = document.getElementById("lineChart").getContext("2d");
  if (lineChart) lineChart.destroy(); // Destroy the previous chart instance if exists
  lineChart = new Chart(ctx, {
    type: "line",
    data: chartData, // Make sure to use chartData here
    options: {
      scales: {
        x: {
          type: "category",
          title: {
            display: true,
            text: "Month",
          },
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Sales",
          },
        },
      },
    },
  });
}

function updateSummaryCards(data) {
  const totalSales = data.reduce((sum, record) => sum + record.Sales, 0);
  const averageSales = totalSales / data.length;

  let topSalesDay = { date: "", sales: 0 };
  data.forEach((item) => {
    if (item.Sales > topSalesDay.sales) {
      topSalesDay = { date: item.Date, sales: item.Sales };
    }
  });

  document.getElementById("totalSales").textContent = `$${totalSales.toFixed(
    2
  )}`;
  document.getElementById(
    "averageSales"
  ).textContent = `$${averageSales.toFixed(2)}`;
  document.getElementById("topSalesDay").textContent = `${
    topSalesDay.date
  } ($${topSalesDay.sales.toFixed(2)})`;
}

let tableLimit = 10; // Initial number of rows to display

function populateDataTable(data) {
  const tableBody = document
    .getElementById("dataTable")
    .getElementsByTagName("tbody")[0];
  tableBody.innerHTML = ""; // Clear existing data

  // Show only a limited number of rows initially
  data.slice(0, tableLimit).forEach((row) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${row.Date}</td><td>${row.Sales}</td><td>${row.Product}</td><td>${row.Region}</td>`;
    tableBody.appendChild(tr);
  });

  // Adjust the visibility of the "Read More" button
  const readMoreBtn = document.getElementById("readMoreBtn");
  if (data.length > tableLimit) {
    readMoreBtn.style.display = "block";
  } else {
    readMoreBtn.style.display = "none";
  }
}

function showMoreData() {
  tableLimit = originalData.length; // Update the limit to the total data length
  populateDataTable(originalData); // Repopulate the table with all data
}

// Event listener for the product filter
document
  .getElementById("productFilter")
  .addEventListener("change", function (event) {
    const selectedProduct = event.target.value;
    const filteredData = originalData.filter(
      (item) => selectedProduct === "All" || item.Product === selectedProduct
    );
    updateCharts(filteredData);
    updateSummaryCards(filteredData);
    populateDataTable(filteredData);
  });

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    document.querySelector(this.getAttribute("href")).scrollIntoView({
      behavior: "smooth",
    });
  });
});
