function setupExportButtons() {
    // PDF Export
    document.getElementById('toPDF').addEventListener('click', () => exportToPDF());

    // CSV Export
    document.getElementById('toCSV').addEventListener('click', () => exportToCSV());

    // Excel Export
    document.getElementById('toEXCEL').addEventListener('click', () => exportToExcel());

    // JSON Export
    document.getElementById('toJSON').addEventListener('click', () => exportToJSON());
}

function exportToPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const table = document.querySelector("table");

    // jsPDF autoTable plugin for tables
    doc.autoTable({ html: table });

    // Save PDF
    doc.save("students_record.pdf");
}

function exportToCSV() {
    const table = document.querySelector("table");
    const rows = Array.from(table.rows);

    const csvContent = rows.map(row => {
        const cells = Array.from(row.cells).map(cell => cell.textContent);
        return cells.join(",");
    }).join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "students_record.csv";
    link.click();
}

function exportToExcel() {
    const table = document.querySelector("table");
    const rows = Array.from(table.rows);

    const wb = XLSX.utils.table_to_book(table, { sheet: "Sheet1" });
    XLSX.writeFile(wb, "students_record.xlsx");
}

function exportToJSON() {
    const table = document.querySelector("table");
    const rows = Array.from(table.rows);

    const headers = Array.from(rows[0].cells).map(cell => cell.textContent);
    const data = rows.slice(1).map(row => {
        const cells = Array.from(row.cells);
        let rowData = {};
        cells.forEach((cell, index) => {
            rowData[headers[index]] = cell.textContent;
        });
        return rowData;
    });

    const jsonContent = JSON.stringify(data, null, 2);

    const blob = new Blob([jsonContent], { type: 'application/json' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "students_record.json";
    link.click();
}

// Initialize
setupExportButtons();


document.addEventListener('DOMContentLoaded', async () => {
    const supabaseUrl = 'https://lqugerdmxqpvigfchfgz.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxdWdlcmRteHFwdmlnZmNoZmd6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNTcwOTY1OCwiZXhwIjoyMDUxMjg1NjU4fQ.rYe9asgVqtbiJmPJwb30THyM913FYwrMAnGHm_4AEDY';
    const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey, { db: { schema: 'schoolmanagement' } });
    const tableBody = document.getElementById('table-body');

    // Fetch data and populate table
    async function fetchAndPopulateTable() {
        try {
            const { data, error } = await supabaseClient.from('restricted_udl_students').select('*');
            if (error) throw new Error(error.message);
            renderTable(data || []);
        } catch (err) {
            console.error('Error fetching data:', err);
        }
    }

    // Render table rows dynamically
    function renderTable(data) {
        tableBody.innerHTML = data.map((row, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${row.name || 'N/A'}</td>
                <td>${row.phone_number || 'N/A'}</td>
                <td>${row.city || 'N/A'}</td>
                <td>${row.course_type || 'N/A'}</td>
                <td>${row.networker || 'N/A'}</td>
                <td>${row.course_language || 'N/A'}</td>
                <td>${row.additional_info || 'N/A'}</td>
                <td>${row.created_at ? new Date(row.created_at).toISOString().split('T')[0] : 'N/A'}</td>
            </tr>
        `).join('');
        applyTableFeatures();
    }

    // Apply additional table features like search and sort
    function applyTableFeatures() {
        const searchInput = document.querySelector('.input-group input');
        const headers = document.querySelectorAll('thead th');

        // Attach search functionality
        searchInput.addEventListener('input', () => {
            const filter = searchInput.value.toLowerCase();
            const rows = tableBody.querySelectorAll('tr');
            rows.forEach(row => {
                const cells = Array.from(row.querySelectorAll('td'));
                const matches = cells.some(cell => cell.textContent.toLowerCase().includes(filter));
                row.style.display = matches ? '' : 'none';
            });
        });

        // Attach sorting functionality
        headers.forEach((header, index) => {
            header.addEventListener('click', () => {
                const rowsArray = Array.from(tableBody.querySelectorAll('tr'));
                const isAscending = header.classList.contains('asc');
                const direction = isAscending ? -1 : 1;

                // Remove existing sorting classes
                headers.forEach(h => h.classList.remove('asc', 'desc'));

                // Sort rows
                rowsArray.sort((a, b) => {
                    const aText = a.cells[index].textContent.trim();
                    const bText = b.cells[index].textContent.trim();

                    if (!isNaN(aText) && !isNaN(bText)) {
                        return direction * (Number(aText) - Number(bText));
                    } else {
                        return direction * aText.localeCompare(bText);
                    }
                });

                // Toggle sorting direction
                header.classList.toggle('asc', !isAscending);
                header.classList.toggle('desc', isAscending);

                // Append sorted rows back to the table
                rowsArray.forEach(row => tableBody.appendChild(row));
            });
        });
    }



    // Initialize
    await fetchAndPopulateTable();
});

