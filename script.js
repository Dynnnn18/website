// Hitung total dipinjam (perorangan + project) dan tersedia untuk satu barang
function getDipinjamDanTersedia(toolNama) {
    // Total stock
    const tool = tools.find(t => t.nama === toolNama);
    const totalJumlah = tool ? parseInt(tool.jumlah) : 0;
    // Dipinjam perorangan
    const dipinjamPerorangan = borrowedList.filter(item => item.tool === toolNama).reduce((sum, item) => sum + parseInt(item.qty), 0);
    // Dipinjam project
    let dipinjamProject = 0;
    if (Array.isArray(borrowedProjectList)) {
        borrowedProjectList.forEach(project => {
            if (Array.isArray(project.tools)) {
                project.tools.forEach(t => {
                    if (t.tool === toolNama) {
                        dipinjamProject += parseInt(t.qty);
                    }
                });
            }
        });
    }
    const dipinjam = dipinjamPerorangan + dipinjamProject;
    const tersedia = totalJumlah - dipinjam;
    return { totalJumlah, dipinjam, tersedia };
}
// ===== Project Permit Tools Pending Approval Logic =====
let pendingProjectApprovals = [];
let borrowedProjectList = [];

function loadPendingProjectApprovals() {
    const saved = localStorage.getItem('pendingProjectApprovals');
    if (saved) {
        pendingProjectApprovals = JSON.parse(saved);
    }
}

function savePendingProjectApprovals() {
    localStorage.setItem('pendingProjectApprovals', JSON.stringify(pendingProjectApprovals));
}

function loadBorrowedProjectList() {
    const saved = localStorage.getItem('borrowedProjectList');
    if (saved) {
        borrowedProjectList = JSON.parse(saved);
    }
}

function saveBorrowedProjectList() {
    localStorage.setItem('borrowedProjectList', JSON.stringify(borrowedProjectList));
}

function renderBorrowedProjectList() {
    const tbody = document.getElementById('borrowedProjectList');
    if (!tbody) return;
    tbody.innerHTML = '';
    if (borrowedProjectList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">Belum ada barang dipinjam project</td></tr>';
        return;
    }
    borrowedProjectList.forEach((item, idx) => {
        const barangList = item.tools.map(t => `${t.tool} (${t.qty})`).join(', ');
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.location}</td>
            <td>${item.pic}</td>
            <td>${barangList}</td>
            <td>${item.time}</td>
            <td>${item.notes}</td>
        `;
        tbody.appendChild(tr);
    });
}

function renderPendingProjectApprovals() {
    const tbody = document.getElementById('pendingProjectApprovalsList');
    if (!tbody) return;
    tbody.innerHTML = '';
    if (pendingProjectApprovals.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">Tidak ada data</td></tr>';
        return;
    }
    pendingProjectApprovals.forEach((item, idx) => {
        const barangList = item.tools.map(t => `${t.tool} (${t.qty})`).join(', ');
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.location}</td>
            <td>${item.pic}</td>
            <td>${barangList}</td>
            <td>${item.notes}</td>
            <td>${item.time}</td>
            <td>
              <button class="btn primary" onclick="approveProjectPermit(${idx})">Approve</button>
              <button class="btn danger" onclick="rejectProjectPermit(${idx})">Reject</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function approveProjectPermit(idx) {
    // Ambil data permit
    const item = pendingProjectApprovals[idx];
    // Gabungkan jika project (lokasi & pic) sama, akumulasi qty barangnya
    let found = false;
    for (let i = 0; i < borrowedProjectList.length; i++) {
        const bp = borrowedProjectList[i];
        if (bp.location === item.location && bp.pic === item.pic) {
            // Gabungkan tools
            item.tools.forEach(t => {
                const exist = bp.tools.find(et => et.tool === t.tool);
                if (exist) {
                    exist.qty = (parseInt(exist.qty) + parseInt(t.qty)).toString();
                } else {
                    bp.tools.push({...t});
                }
            });
            // Catatan dan waktu update ke yang terbaru
            bp.notes = item.notes;
            bp.time = item.time;
            found = true;
            break;
        }
    }
    if (!found) {
        borrowedProjectList.push(item);
    }
    saveBorrowedProjectList();
    renderBorrowedProjectList();
    if (typeof renderTools === 'function') renderTools();
    // Hapus dari pending
    pendingProjectApprovals.splice(idx, 1);
    savePendingProjectApprovals();
    renderPendingProjectApprovals();
    alert('Project permit disetujui dan barang masuk ke daftar pinjaman project!');
}

function rejectProjectPermit(idx) {
    pendingProjectApprovals.splice(idx, 1);
    savePendingProjectApprovals();
    renderPendingProjectApprovals();
    alert('Project permit ditolak!');
}

// ===== Project Permit Tools Multi Input Logic =====
let projectToolsList = [];

function openAddProjectToolModal() {
    const modal = document.getElementById('addProjectToolModal');
    const select = document.getElementById('selectProjectTool');
    const qtyInput = document.getElementById('selectProjectQty');
    if (!modal || !select || !qtyInput) return;
    // Populate select with available tools from stock (exclude already selected)
    select.innerHTML = '';
    tools.forEach(tool => {
        // Hitung sisa stock (total - dipinjam - sudah dipilih di projectToolsList)
        const total = parseInt(tool.jumlah);
        const dipinjam = borrowedList.filter(item => item.tool === tool.nama).reduce((sum, item) => sum + parseInt(item.qty), 0);
        const sudahDipilih = projectToolsList.find(item => item.tool === tool.nama);
        const tersedia = total - dipinjam;
        if (tersedia > 0 && !sudahDipilih) {
            const opt = document.createElement('option');
            opt.value = tool.nama;
            opt.textContent = `${tool.nama} (Tersedia: ${tersedia})`;
            opt.dataset.max = tersedia;
            select.appendChild(opt);
        }
    });
    qtyInput.value = '';
    qtyInput.min = 1;
    qtyInput.max = select.options.length > 0 ? select.options[0].dataset.max : 1;
    select.onchange = function() {
        const max = select.options[select.selectedIndex]?.dataset.max || 1;
        qtyInput.max = max;
        qtyInput.value = '';
    };
    modal.classList.add('active');
}

function closeAddProjectToolModal() {
    const modal = document.getElementById('addProjectToolModal');
    if (modal) modal.classList.remove('active');
}

function addProjectToolFromModal() {
    const select = document.getElementById('selectProjectTool');
    const qtyInput = document.getElementById('selectProjectQty');
    const toolName = select.value;
    const max = parseInt(select.options[select.selectedIndex]?.dataset.max || '1');
    const qty = parseInt(qtyInput.value);
    if (!toolName) {
        alert('Pilih barang!');
        return;
    }
    if (!qty || qty < 1) {
        alert('Qty harus diisi dan minimal 1!');
        qtyInput.focus();
        return;
    }
    if (qty > max) {
        alert('Qty melebihi stock tersedia!');
        qtyInput.focus();
        return;
    }
    projectToolsList.push({ tool: toolName, qty });
    renderProjectToolsList();
    closeAddProjectToolModal();
}

function removeProjectTool(idx) {
    projectToolsList.splice(idx, 1);
    renderProjectToolsList();
}

function renderProjectToolsList() {
    const tbody = document.getElementById('projectToolsList');
    if (!tbody) return;
    tbody.innerHTML = '';
    if (projectToolsList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" class="text-center">Belum ada barang dipilih</td></tr>';
        return;
    }
    projectToolsList.forEach((item, idx) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.tool}</td>
            <td>${item.qty}</td>
            <td><button type="button" class="btn danger" onclick="removeProjectTool(${idx})"><i class="fas fa-trash"></i></button></td>
        `;
        tbody.appendChild(tr);
    });
}

// Reset project tools list saat form dibuka/submit
function resetProjectPermitForm() {
    projectToolsList = [];
    renderProjectToolsList();
    document.getElementById('projectPermitForm').reset();
}

// Render datalist barang dari tools
function renderProjectBorrowToolOptions() {
    const datalist = document.getElementById('projectBorrowToolList');
    if (!datalist) return;
    datalist.innerHTML = '';
    tools.forEach(tool => {
        const opt = document.createElement('option');
        opt.value = tool.nama;
        datalist.appendChild(opt);
    });
}

// Submit Project Permit
document.addEventListener('DOMContentLoaded', function() {
    renderProjectToolsList();
    renderProjectBorrowToolOptions();
    // Reset form saat tab permit dibuka
    const permitBtn = document.getElementById('tab-permit-btn');
    if (permitBtn) {
        permitBtn.addEventListener('click', resetProjectPermitForm);
    }
    // Jaga-jaga reset juga saat form dibuka manual
    const form = document.getElementById('projectPermitForm');
    if (form) {
        form.addEventListener('reset', renderProjectToolsList);
    }
});

const projectPermitForm = document.getElementById('projectPermitForm');
if (projectPermitForm) {
    projectPermitForm.onsubmit = function(e) {
        e.preventDefault();
        const location = document.getElementById('projectLocation').value.trim();
        const pic = document.getElementById('projectPIC').value.trim();
        const notes = document.getElementById('projectBorrowNotes').value.trim();
        if (!location || !pic || !notes) {
            alert('Semua field wajib diisi!');
            return;
        }
        if (projectToolsList.length === 0) {
            alert('Pilih minimal satu barang!');
            return;
        }
        const now = new Date();
        const time = now.toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
        pendingProjectApprovals.push({
            location,
            pic,
            notes,
            tools: JSON.parse(JSON.stringify(projectToolsList)),
            time
        });
        savePendingProjectApprovals();
        renderPendingProjectApprovals();
        alert('Project permit berhasil diajukan, menunggu approval!');
        resetProjectPermitForm();
    };
}

// --- PATCH: Render pending project approvals on load ---
document.addEventListener('DOMContentLoaded', function() {
    loadPendingProjectApprovals();
    renderPendingProjectApprovals();
    loadBorrowedProjectList();
    renderBorrowedProjectList();
    renderReturnProjectList();
});

// Toggle table Stock Tools di tab Stock dengan klik judul section
function toggleStockToolsTable() {
    var wrapper = document.getElementById('stockToolsSection');
    if (!wrapper) return;
    if (wrapper.style.display === 'none' || wrapper.style.display === '') {
        wrapper.style.display = 'block';
    } else {
        wrapper.style.display = 'none';
    }
}

// Toggle table Barang Dipinjam di tab Stock dengan klik judul section
function toggleBorrowedTable() {
    var wrapper = document.getElementById('borrowedTableWrapper');
    if (!wrapper) return;
    if (wrapper.style.display === 'none' || wrapper.style.display === '') {
        wrapper.style.display = 'block';
    } else {
        wrapper.style.display = 'none';
    }
}

// Pasang event listener pada judul section setelah DOM siap
document.addEventListener('DOMContentLoaded', function() {
    // Barang Dipinjam tidak lagi di-hide, tidak perlu event listener atau sembunyikan
    var borrowedTableWrapper = document.getElementById('borrowedTableWrapper');
    if (borrowedTableWrapper) {
        borrowedTableWrapper.style.display = '';
    }

    // Stock Tools tidak lagi di-hide, tidak perlu event listener atau sembunyikan

    // Event listener untuk judul Perorang
    var perorangHeader = document.getElementById('perorangSectionHeader');
    if (perorangHeader) {
        perorangHeader.style.cursor = 'pointer';
        perorangHeader.addEventListener('click', function() {
            var perorangTable = document.getElementById('perorangTableWrapper');
            if (perorangTable) {
                if (perorangTable.style.display === 'none' || perorangTable.style.display === '') {
                    perorangTable.style.display = 'block';
                } else {
                    perorangTable.style.display = 'none';
                }
            }
        });
        // Sembunyikan tabel perorang di awal
        var perorangTable = document.getElementById('perorangTableWrapper');
        if (perorangTable) {
            perorangTable.style.display = 'none';
        }
    }

    // Toggle Project table in Barang Dipinjam
    var projectHeader = document.getElementById('projectSectionHeader');
    if (projectHeader) {
        projectHeader.style.cursor = 'pointer';
        projectHeader.addEventListener('click', function() {
            var projectTable = document.getElementById('projectTableWrapper');
            if (projectTable) {
                if (projectTable.style.display === 'none' || projectTable.style.display === '') {
                    projectTable.style.display = 'block';
                } else {
                    projectTable.style.display = 'none';
                }
            }
        });
        // Hide project table by default
        var projectTable = document.getElementById('projectTableWrapper');
        if (projectTable) {
            projectTable.style.display = 'none';
        }
    }
});
// Render list of borrowed items in return tab with Return button
function renderReturnBorrowedList() {
    const tbody = document.getElementById('returnBorrowedList');
    if (!tbody) return;
    tbody.innerHTML = '';
    if (borrowedList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">Belum ada barang dipinjam</td></tr>';
        return;
    }
    borrowedList.forEach((item, idx) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.borrower}</td>
            <td>${item.tool}</td>
            <td>${item.qty}</td>
            <td><input type="number" id="returnQtyInput_${idx}" min="1" max="${item.qty}" value="${item.qty}" style="width:60px; margin-left:5px;" required></td>
            <td>${item.time}</td>
            <td><input type="text" id="returnNotesInput_${idx}" placeholder="Kondisi barang..." required style="width:120px"></td>
            <td><button class="btn btn-add" onclick="returnBorrowedItem(${idx})">Return</button></td>
        `;
        tbody.appendChild(tr);
    });
}

// Handle return borrowed item
function returnBorrowedItem(idx) {
    const item = borrowedList[idx];
    const notesInput = document.getElementById('returnNotesInput_' + idx);
    const qtyInput = document.getElementById('returnQtyInput_' + idx);
    const notes = notesInput ? notesInput.value.trim() : '';
    const returnQty = qtyInput ? parseInt(qtyInput.value) : 0;
    if (!notes) {
        alert('Catatan kondisi barang wajib diisi!');
        notesInput && notesInput.focus();
        return;
    }
    if (!returnQty || returnQty < 1 || returnQty > parseInt(item.qty)) {
        alert('Jumlah return tidak valid!');
        qtyInput && qtyInput.focus();
        return;
    }
    // Update notes di stock tools (jika ada catatan baru)
    const stockTool = tools.find(t => t.nama === item.tool);
    if (stockTool) {
        stockTool.notes = notes || stockTool.notes;
        stockTool.jumlah = parseInt(stockTool.jumlah) + returnQty;
        saveToLocalStorage();
        renderTools();
    }
    // Kurangi qty di borrowedList
    item.qty = parseInt(item.qty) - returnQty;
    if (item.qty === 0) {
        borrowedList.splice(idx, 1);
    }
    saveBorrowedList();
    renderBorrowedList();
    renderReturnBorrowedList();
    alert('Barang berhasil direturn.');
}
// Barang dipinjam logic
let borrowedList = [];
// Handover logic
function renderHandoverBorrowedList() {
    const tbody = document.getElementById('handoverBorrowedList');
    if (!tbody) return;
    tbody.innerHTML = '';
    if (borrowedList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">Belum ada barang dipinjam</td></tr>';
        return;
    }
    borrowedList.forEach((item, idx) => {
        const tr = document.createElement('tr');
        // Kolom: Dari Teknisi | Ke Teknisi (dropdown) | Nama Barang | Jumlah | Tanggal | Catatan (input) | Aksi
        tr.innerHTML = `
            <td>${item.borrower}</td>
            <td>
              <select id="handoverToSelect_${idx}" class="handover-to-select">
                <option value="">Pilih Teknisi</option>
                <option value="Ady">Ady</option>
                <option value="Abdul">Abdul</option>
                <option value="Raja">Raja</option>
              </select>
            </td>
            <td>${item.tool}</td>
            <td>${item.qty}</td>
            <td>${item.time}</td>
            <td><input type="text" id="handoverNotesInput_${idx}" placeholder="Catatan..." required style="width:120px"></td>
            <td><button class="btn btn-add" onclick="handoverRequestFromBorrowed(${idx})">Handover</button></td>
        `;
        tbody.appendChild(tr);
    });
}

// Handle handover request from borrowed item
function handoverRequestFromBorrowed(idx) {
    const item = borrowedList[idx];
    // Ambil nama teknisi tujuan dari dropdown di baris ini
    const select = document.getElementById('handoverToSelect_' + idx);
    const to = select ? select.value : '';
    const notesInput = document.getElementById('handoverNotesInput_' + idx);
    const notes = notesInput ? notesInput.value.trim() : '';
    if (!to) {
        alert('Pilih "Ke Teknisi" terlebih dahulu!');
        select && select.focus();
        return;
    }
    if (!notes) {
        alert('Catatan handover wajib diisi!');
        notesInput && notesInput.focus();
        return;
    }
    const now = new Date();
    const time = now.toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
    handoverRequests.push({
        from: item.borrower,
        to,
        tool: item.tool,
        qty: item.qty,
        notes,
        time
    });
    saveHandoverRequests();
    renderPendingHandoverApprovals();
    alert('Request handover telah diajukan untuk approval.');
}
let handoverRequests = [];

function loadBorrowedList() {
    const saved = localStorage.getItem('borrowedList');
    if (saved) {
        borrowedList = JSON.parse(saved);
    }
}

function saveBorrowedList() {
    localStorage.setItem('borrowedList', JSON.stringify(borrowedList));
}

function loadHandoverRequests() {
    const saved = localStorage.getItem('handoverRequests');
    if (saved) {
        handoverRequests = JSON.parse(saved);
    }
}

function saveHandoverRequests() {
    localStorage.setItem('handoverRequests', JSON.stringify(handoverRequests));
}

function renderBorrowedList() {
    const tbody = document.getElementById('borrowedList');
    if (!tbody) return;
    tbody.innerHTML = '';
    if (borrowedList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">Belum ada barang dipinjam</td></tr>';
        return;
    }
    borrowedList.forEach((item) => {
        const tr = document.createElement('tr');
        tr.setAttribute('onclick', `showDetailByName('${item.tool.replace(/'/g, "&#39;")}')`);
        tr.innerHTML = `
            <td>${item.borrower}</td>
            <td>${item.tool}</td>
            <td>${item.qty}</td>
            <td>${item.time}</td>
            <td>${item.notes || '-'}</td>
        `;
        tbody.appendChild(tr);
    });
}
// Pending Approvals logic
let pendingApprovals = [];

// Render Pending Handover Approvals
function renderPendingHandoverApprovals() {
    const tbody = document.getElementById('pendingHandoverApprovalsList');
    if (!tbody) return;
    tbody.innerHTML = '';
    if (handoverRequests.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">Belum ada request</td></tr>';
        return;
    }
    handoverRequests.forEach((req, idx) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${req.tool}</td>
            <td>${req.from}</td>
            <td>${req.to}</td>
            <td>${req.qty}</td>
            <td>${req.notes || '-'}</td>
            <td>${req.time}</td>
            <td>
                <button class="btn btn-add" onclick="approveHandoverRequest(${idx})"><i class='fas fa-check'></i></button>
                <button class="btn btn-delete" onclick="rejectHandoverRequest(${idx})"><i class='fas fa-times'></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function approveHandoverRequest(idx) {
    // Update borrower di borrowedList sesuai handover
    const req = handoverRequests[idx];
    // Cari item yang dipinjam oleh req.from, tool sama, qty sama (atau minimal tool & from)
    const borrowedIdx = borrowedList.findIndex(item => item.borrower === req.from && item.tool === req.tool && item.qty === req.qty);
    if (borrowedIdx !== -1) {
        borrowedList[borrowedIdx].borrower = req.to;
        // Update waktu pinjam ke waktu handover agar urut
        borrowedList[borrowedIdx].time = req.time;
        saveBorrowedList();
        renderBorrowedList();
        renderReturnBorrowedList && renderReturnBorrowedList();
        renderHandoverBorrowedList && renderHandoverBorrowedList();
    }
    handoverRequests.splice(idx, 1);
    saveHandoverRequests();
    renderPendingHandoverApprovals();
}

function rejectHandoverRequest(idx) {
    handoverRequests.splice(idx, 1);
    saveHandoverRequests();
    renderPendingHandoverApprovals();
}

function loadPendingApprovals() {
    const saved = localStorage.getItem('pendingApprovals');
    if (saved) {
        pendingApprovals = JSON.parse(saved);
    }
}

function savePendingApprovals() {
    localStorage.setItem('pendingApprovals', JSON.stringify(pendingApprovals));
}

function renderPendingApprovals() {
    const tbody = document.getElementById('pendingApprovalsList');
    if (!tbody) return;
    tbody.innerHTML = '';
    if (pendingApprovals.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">Belum ada request</td></tr>';
        return;
    }
    pendingApprovals.forEach((req, idx) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${req.tool}</td>
            <td>${req.borrower}</td>
            <td>${req.qty}</td>
            <td>${req.notes || '-'}</td>
            <td>${req.time}</td>
            <td>
                <button class="btn btn-add" onclick="approveRequest(${idx})"><i class='fas fa-check'></i></button>
                <button class="btn btn-delete" onclick="rejectRequest(${idx})"><i class='fas fa-times'></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function approveRequest(idx) {
    // Pindahkan ke borrowedList
    const approved = pendingApprovals[idx];
    borrowedList.push(approved);
    // Tidak mengurangi jumlah stock barang (total jumlah tetap)
    saveToLocalStorage();
    renderTools();
    saveBorrowedList();
    renderBorrowedList();
    // Hapus dari pending
    pendingApprovals.splice(idx, 1);
    savePendingApprovals();
    renderPendingApprovals();
}

function rejectRequest(idx) {
    pendingApprovals.splice(idx, 1);
    savePendingApprovals();
    renderPendingApprovals();
}

// Handle submit form permit
window.addEventListener('DOMContentLoaded', function() {
    // ...existing code...
    loadBorrowedList();
    renderBorrowedList();
    renderReturnBorrowedList();
    renderHandoverBorrowedList();
    // Set username akun (dummy)
    const username = 'userdemo'; // Ganti dengan username login jika ada auth
    // No need to autofill borrowerName, now a select
    // Set Pinjam Dari to Inventory (readonly)
    const borrowFromInput = document.getElementById('borrowFrom');
    if (borrowFromInput) {
        borrowFromInput.value = 'Inventory';
    }

    // Handover form username autofill
    const handoverFromInput = document.getElementById('handoverFrom');
    if (handoverFromInput) {
        handoverFromInput.value = username;
    }

    // Handover form submit
    const handoverForm = document.getElementById('handoverRequestForm');
    if (handoverForm) {
        handoverForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const from = document.getElementById('handoverFrom').value.trim();
            const tool = document.getElementById('handoverTool').value.trim();
            const qty = document.getElementById('handoverQty').value;
            const notes = document.getElementById('handoverNotes').value.trim();
            if (!from || !tool || !qty) {
                alert('Semua field bertanda * wajib diisi!');
                return;
            }
            const now = new Date();
            const time = now.toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
            handoverRequests.push({ from, tool, qty, notes, time });
            saveHandoverRequests();
            renderPendingHandoverApprovals();
            // Reset form, tetap isi username
            handoverForm.reset();
            if (handoverFromInput) handoverFromInput.value = username;
        });
    }
    const form = document.getElementById('borrowRequestForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const borrowFrom = document.getElementById('borrowFrom').value.trim();
            const borrower = document.getElementById('borrowerName').value.trim();
            const tool = document.getElementById('borrowTool').value.trim();
            const qty = document.getElementById('borrowQty').value;
            const notes = document.getElementById('borrowNotes').value.trim();
            if (!borrowFrom || !borrower || !tool || !qty || !notes) {
                alert('Semua field bertanda * wajib diisi!');
                return;
            }
            // Validasi: tool harus ada di stock
            const stockTool = tools.find(t => t.nama === tool);
            if (!stockTool) {
                alert('Pilih barang dari daftar stock yang tersedia!');
                document.getElementById('borrowTool').focus();
                return;
            }
            // Validasi: qty pinjam tidak boleh melebihi sisa stock (stock dikurangi yang sedang dipinjam dan pending approval)
            // Hitung total qty barang ini yang sedang dipinjam (dari borrowedList)
            const borrowedQty = borrowedList
                .filter(item => item.tool === tool)
                .reduce((sum, item) => sum + parseInt(item.qty), 0);
            // Hitung total qty barang ini yang masih pending approval, TIDAK termasuk request yang sedang disubmit (karena belum masuk ke pendingApprovals)
            const pendingQty = pendingApprovals
                .filter(item => item.tool === tool)
                .reduce((sum, item) => sum + parseInt(item.qty), 0);
            // Sisa stock yang benar adalah stock - borrowed - pending
            let sisaStock = parseInt(stockTool.jumlah) - borrowedQty - pendingQty;
            // Jika user mengajukan request, izinkan selama qty <= sisaStock+qty (karena request ini belum masuk ke pending)
            if (parseInt(qty) > (sisaStock + parseInt(qty))) {
                // Ini tidak akan pernah terjadi, tapi untuk safety
                alert('Jumlah pinjam tidak boleh lebih dari stock yang tersedia! (Sisa: ' + (sisaStock < 0 ? 0 : sisaStock) + ')');
                document.getElementById('borrowQty').focus();
                return;
            }
            if (parseInt(qty) > sisaStock) {
                alert('Jumlah pinjam tidak boleh lebih dari stock yang tersedia! (Sisa: ' + (sisaStock < 0 ? 0 : sisaStock) + ')');
                document.getElementById('borrowQty').focus();
                return;
            }
            const now = new Date();
            const time = now.toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
            pendingApprovals.push({ borrowFrom, borrower, tool, qty, notes, time });
            savePendingApprovals();
            renderPendingApprovals();
            // Reset form
            form.reset();
            if (borrowFromInput) borrowFromInput.value = 'Inventory';
        });
    }
    loadPendingApprovals();
    renderPendingApprovals();

    loadHandoverRequests();
    renderPendingHandoverApprovals();
    // Re-render handover borrowed list when borrowedList changes
    // Patch renderBorrowedList to also update handover tab
    const origRenderBorrowedList = renderBorrowedList;
    renderBorrowedList = function() {
        origRenderBorrowedList.apply(this, arguments);
        renderHandoverBorrowedList();
        renderReturnBorrowedList();
    };
});
// Tab switching logic
function showTab(tab) {
    const tabs = ['stock', 'permit', 'handover', 'return'];
    tabs.forEach(function(name) {
        document.getElementById('tab-' + name).style.display = (name === tab) ? 'block' : 'none';
        document.getElementById('tab-' + name + '-btn').classList.toggle('active', name === tab);
    });
}
// Menampilkan detail barang berdasarkan nama (untuk tabel Barang Dipinjam)
function showDetailByName(namaBarang) {
    const index = tools.findIndex(tool => tool.nama === namaBarang);
    if (index !== -1) {
        showDetail(index);
    } else {
        alert('Data barang tidak ditemukan!');
    }
}
let tools = [];
let currentIndex = -1;
let isEditMode = false;

// Inisialisasi aplikasi
document.addEventListener('DOMContentLoaded', function() {
    loadFromLocalStorage();
    renderTools();
    setupEventListeners();
    renderBorrowToolOptions();
    // Jika tidak ada data, tambahkan sample data
    if (tools.length === 0) {
        loadSampleData();
        renderBorrowToolOptions();
    }
});

// Mengisi datalist tools pada permit
function renderBorrowToolOptions() {
    const datalist = document.getElementById('borrowToolList');
    if (!datalist) return;
    datalist.innerHTML = '';
    tools.forEach(tool => {
        const opt = document.createElement('option');
        opt.value = tool.nama;
        datalist.appendChild(opt);
    });

    // Handover tool options: only show tools that are currently borrowed
    const handoverDatalist = document.getElementById('handoverToolList');
    if (handoverDatalist) {
        handoverDatalist.innerHTML = '';
        // Use a Set to avoid duplicate tool names
        const borrowedToolNames = new Set(borrowedList.map(item => item.tool));
        borrowedToolNames.forEach(toolName => {
            const opt = document.createElement('option');
            opt.value = toolName;
            handoverDatalist.appendChild(opt);
        });
    }
}

function loadSampleData() {
    tools = [
        {
            nama: "Obeng Set",
            jumlah: 5,
            notes: "Obeng set lengkap dengan berbagai ukuran",
            foto: ""
        },
        {
            nama: "Tang Kombinasi",
            jumlah: 3,
            notes: "Tang kombinasi merek ABC",
            foto: ""
        },
        {
            nama: "Gerinda",
            jumlah: 2,
            notes: "1 unit sedang diperbaiki",
            foto: ""
        }
    ];
    // Set kondisi awal: tidak ada yang dipinjam atau pending
    borrowedList = [];
    pendingApprovals = [];
    saveBorrowedList();
    savePendingApprovals();
    saveToLocalStorage();
    renderTools();
}

function loadFromLocalStorage() {
    const savedTools = localStorage.getItem('tools');
    if (savedTools) {
        tools = JSON.parse(savedTools);
    }
}

function saveToLocalStorage() {
    localStorage.setItem('tools', JSON.stringify(tools));
}

function setupEventListeners() {
    // Untuk menampilkan nama file yang diupload
    document.getElementById('fotoUpload').addEventListener('change', function(e) {
        const fileName = e.target.files[0] ? e.target.files[0].name : "Belum ada file dipilih";
        document.getElementById('fileName').textContent = fileName;
    });
}

// Fungsi untuk menampilkan/menyembunyikan modal
function toggleModal(modalId, show) {
    const modal = document.getElementById(modalId);
    if (show) {
        modal.classList.add('active');
    } else {
        modal.classList.remove('active');
    }
}

function showForm() {
    resetForm();
    isEditMode = false;
    document.getElementById('formTitle').innerHTML = '<i class="fas fa-plus-circle"></i> Tambah Barang';
    toggleModal('formModal', true);
}

function showDetail(index) {
    currentIndex = index;
    const tool = tools[index];
    document.getElementById('detailNama').textContent = tool.nama;
    document.getElementById('detailJumlah').textContent = tool.jumlah;
    document.getElementById('detailNotes').textContent = tool.notes || '-';
    // Handle photo
    const fotoElement = document.getElementById('detailFoto');
    const fotoTextElement = document.getElementById('detailFotoText');
    if (tool.foto) {
        fotoElement.src = tool.foto;
        fotoElement.style.display = 'block';
        fotoTextElement.style.display = 'none';
    } else {
        fotoElement.style.display = 'none';
        fotoTextElement.style.display = 'block';
    }
    toggleModal('detailModal', true);
}

function submitForm() {
    const nama = document.getElementById('namaBarang').value.trim();
    const jumlah = document.getElementById('jumlahBarang').value;
    const notes = document.getElementById('notes').value.trim();
    const fotoFile = document.getElementById('fotoUpload').files[0];

    if (!nama || !jumlah) {
        alert('Nama barang dan jumlah harus diisi!');
        return;
    }

    const newTool = {
        nama,
        jumlah,
        notes,
        foto: ""
    };

    // Jika ada file foto yang diupload
    if (fotoFile) {
        const reader = new FileReader();
        reader.onload = function(e) {
            newTool.foto = e.target.result;
            saveTool(newTool);
        };
        reader.readAsDataURL(fotoFile);
    } else {
        // Jika mode edit dan tidak upload foto baru, pertahankan foto lama
        if (isEditMode && tools[currentIndex].foto) {
            newTool.foto = tools[currentIndex].foto;
        }
        saveTool(newTool);
    }
}

function saveTool(tool) {
    if (isEditMode) {
        tools[currentIndex] = tool;
    } else {
        tools.push(tool);
    }
    saveToLocalStorage();
    renderTools();
    renderBorrowToolOptions();
    toggleModal('formModal', false);
}

function renderTools() {
    const tbody = document.getElementById('toolList');
    tbody.innerHTML = '';

    if (tools.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">Tidak ada data</td></tr>';
        return;
    }

    tools.forEach((tool, index) => {
        const { totalJumlah, dipinjam, tersedia } = getDipinjamDanTersedia(tool.nama);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td class="item-name" onclick="showDetail(${index})">${tool.nama}</td>
            <td>${totalJumlah}</td>
            <td>${tersedia}</td>
            <td>${dipinjam}</td>
            <td class="actions">
                <button class="btn secondary" onclick="event.stopPropagation(); editTool(${index})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn danger" onclick="event.stopPropagation(); deleteTool(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function editTool(index) {
    currentIndex = index;
    isEditMode = true;
    const tool = tools[index];
    document.getElementById('formTitle').innerHTML = '<i class="fas fa-edit"></i> Edit Barang';
    document.getElementById('namaBarang').value = tool.nama;
    document.getElementById('jumlahBarang').value = tool.jumlah;
    document.getElementById('notes').value = tool.notes;
    document.getElementById('fileName').textContent = tool.foto ? 'Foto sudah ada' : 'Belum ada foto';
    toggleModal('detailModal', false);
    toggleModal('formModal', true);
}

function deleteTool(index) {
    if (confirm('Apakah Anda yakin ingin menghapus barang ini?')) {
        tools.splice(index, 1);
        saveToLocalStorage();
        renderTools();
        
        // Tutup modal detail jika terbuka
        if (currentIndex === index) {
            toggleModal('detailModal', false);
            currentIndex = -1;
        }
    }
}

function resetForm() {
    document.getElementById('toolForm').reset();
    document.getElementById('fileName').textContent = 'Belum ada file dipilih';
    document.getElementById('fotoUpload').value = '';
}

// Fungsi untuk tombol di HTML
function toggleForm() {
    showForm();
}

function closeModal(modalId) {
    toggleModal(modalId, false);
}

function editCurrentItem() {
    editTool(currentIndex);
}

function renderReturnProjectList() {
    const tbody = document.getElementById('returnProjectList');
    if (!tbody) return;
    tbody.innerHTML = '';
    if (borrowedProjectList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">Tidak ada barang project yang dipinjam</td></tr>';
        return;
    }
    borrowedProjectList.forEach((item, idx) => {
        // Untuk setiap barang di project, tampilkan input notes per barang
        let barangRows = '';
        item.tools.forEach((t, tIdx) => {
            barangRows += `
                <tr>
                    <td>${item.location}</td>
                    <td>${item.pic}</td>
                    <td>${t.tool} (${t.qty})</td>
                    <td><input type="number" id="returnProjectQty_${idx}_${tIdx}" min="1" max="${t.qty}" value="${t.qty}" style="width:60px;" required></td>
                    <td>${item.time}</td>
                    <td><input type="text" id="returnProjectNotes_${idx}_${tIdx}" placeholder="Catatan kondisi..." required style="width:120px"></td>
                    <td><button class="btn btn-add" onclick="returnProjectItem(${idx},${tIdx})">Return</button></td>
                </tr>
            `;
        });
        tbody.innerHTML += barangRows;
    });
}

function returnProjectItem(idx, tIdx) {
    const item = borrowedProjectList[idx];
    const t = item.tools[tIdx];
    // Ambil notes dan qty return
    const notesInput = document.getElementById(`returnProjectNotes_${idx}_${tIdx}`);
    const qtyInput = document.getElementById(`returnProjectQty_${idx}_${tIdx}`);
    const notes = notesInput ? notesInput.value.trim() : '';
    const returnQty = qtyInput ? parseInt(qtyInput.value) : 0;
    if (!notes) {
        alert('Catatan kondisi barang wajib diisi!');
        notesInput && notesInput.focus();
        return;
    }
    if (!returnQty || returnQty < 1 || returnQty > parseInt(t.qty)) {
        alert('Jumlah return tidak valid!');
        qtyInput && qtyInput.focus();
        return;
    }
    // Kembalikan stock barang sesuai nama dan jumlah yang diinput
    const tool = tools.find(tool => tool.nama === t.tool);
    if (tool) {
        tool.jumlah = parseInt(tool.jumlah) + returnQty;
    }
    // Kurangi qty barang yang dipinjam di borrowedProjectList
    t.qty = parseInt(t.qty) - returnQty;
    if (t.qty === 0) {
        item.tools.splice(tIdx, 1);
    }
    // Jika tidak ada barang lagi di project ini, hapus project
    if (item.tools.length === 0) {
        borrowedProjectList.splice(idx, 1);
    }
    saveToLocalStorage();
    renderTools && renderTools();
    saveBorrowedProjectList();
    renderBorrowedProjectList();
    renderReturnProjectList();
    alert('Barang project berhasil dikembalikan!');
}

document.addEventListener('DOMContentLoaded', function() {
    // ...existing code...
    renderReturnProjectList();
});