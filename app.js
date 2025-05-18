document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('stock-form');
  const tableBody = document.getElementById('stock-table-body');
  const search = document.getElementById('search');
  const exportBtn = document.getElementById('export-btn');

  loadStock();
  checkLowStock();
  

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const itemName = document.getElementById('item-name').value.trim();
    const quantity = document.getElementById('quantity').value.trim();
    const expiry = document.getElementById('expiry').value;

    if (!itemName || !quantity) return;

    const item = { itemName, quantity, expiry, dateAdded: new Date().toISOString() };
    addRow(item);
    saveItem(item);
    checkLowStock();
    form.reset();
    
 });

  search.addEventListener('input', () => {
    const keyword = search.value.toLowerCase();
    document.querySelectorAll('#stock-table-body tr').forEach(row => {
      const text = row.innerText.toLowerCase();
      row.style.display = text.includes(keyword) ? '' : 'none';
    });
  });

  exportBtn.addEventListener('click', () => {
    const table = document.getElementById('stock-table-body');
    let csv = [];
    for (let row of table.rows) {
      let cols = [...row.cells].map(cell => cell.innerText);
      csv.push(cols.join(','));
    }
    const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
  link.download = 'clinic_stock.csv';
    link.click();
  });

function addRow(item) {
  const row = document.createElement('tr');

  const quantityValue = parseInt(item.quantity, 10);

  if (quantityValue < 10) {
    row.classList.add('low-stock');
  }

  const name = document.createElement('td');
  name.textContent = item.itemName;

  const qty = document.createElement('td');
  qty.textContent = item.quantity;

  const exp = document.createElement('td');
  exp.textContent = item.expiry || 'N/A';

  if (item.expiry && new Date(item.expiry) < new Date()) {
    row.classList.add('expired');
  }

  const action = document.createElement('td');
  const del = document.createElement('button');
  del.textContent = 'Delete';
  del.className = 'delete-btn';
  del.onclick = () => {
row.remove();
    removeItem(item);
    checkLowStock(); // update banner after deleting
  };
  action.appendChild(del);

  row.append(name, qty, exp, action);
  tableBody.appendChild(row);

 }

  function getStorage() {
    return JSON.parse(localStorage.getItem('clinicStock') || '[]');
  }

  function saveItem(item) {
    const stock = getStorage();
    stock.push(item);
    localStorage.setItem('clinicStock', JSON.stringify(stock));
  }
  
  function removeItem(target) {
    let stock = getStorage();
    stock = stock.filter(item =>
      item.itemName !== target.itemName ||
      item.quantity !== target.quantity ||
      item.expiry !== target.expiry
    );
    localStorage.setItem('clinicStock', JSON.stringify(stock));
  }
  
  function checkLowStock() {
  const stock = getStorage();
  const lowStock = stock.some(item => parseInt(item.quantity, 10) < 10);
  const warning = document.getElementById('low-stock-warning');
  if (warning) {
    warning.classList.toggle('hidden', !lowStock);
  }
}

  function loadStock() {
    const stock = getStorage();
    stock.forEach(addRow);
  }
});

function renderStockItems() {
  const stock = JSON.parse(localStorage.getItem('clinicStock')) || [];
  
  console.log('Stock:', stock);
  
  const tbody = document.getElementById('stock-table-body');
  tbody.innerHTML = '';
  
let lowStockFound = false;
  
  stock.forEach((item, index) => {
    const row = document.createElement('tr');

    // Add "low-stock" class if quantity is below 10
    if (parseInt(item.quantity, 10) <10) {
      row.classList.add('low-stock');
      lowStockFound= true;
    }

    row.innerHTML = `
      <td>${item.itemName}td>
      <td>${item.quantity}</td>
      <td>${item.expiry}</td>
    `;

    tbody.appendChild(row);
  });
  
  const warning= document.getElementById('low-stock-warning');
  if (warning) {
    warning.classList.toggle('hidden', !lowStockFound);
  }
}

document.getElementById('generate-report-btn').addEventListener('click', () => {
  const reportType = prompt("Enter report type (week/month):").toLowerCase();
  if (reportType !== 'week' && reportType !== 'month') {
    alert("Please enter 'week' or 'month'");
    return;
  }

  // Load stock items from localStorage
  const stock = JSON.parse(localStorage.getItem('clinicStock')) || [];

  // Get the current date
  const currentDate = new Date();

  // Filter items based on the report type (week or month)
  const filteredStock = stock.filter(item => {
    const itemDate = new Date(item.dateAdded); // assuming 'dateAdded' exists
    const diffTime = currentDate - itemDate;
    if (reportType === 'week') {
      return diffTime <= 7 * 24 * 60 * 60 * 1000; // 1 week
    } else if (reportType === 'month') {
      return diffTime <= 30 * 24 * 60 * 60 * 1000; // 1 month
    }
  });

  if (filteredStock.length === 0) {
    alert('No stock items to report for the selected period');
    return;
  }

  // Generate CSV
  let csv = 'Item Name,Quantity,Expiry,Date Added\n';
  filteredStock.forEach(item => {
 csv += item.itemName + "," + item.quantity + "," + (item.expiry || 'N/A') + "," + item.dateAdded + "\n";
  });

  // Create CSV file and trigger download
  const blob = new Blob([csv], { type: 'text/csv' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'clinic_stock_report_${reportType}.csv';
  link.click();
});




