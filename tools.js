document.addEventListener('DOMContentLoaded', function() {
    // Tab Switching Functionality
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Show the corresponding content
            const tabId = button.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // Set current date/time for forms
    const now = new Date();
    const currentDateTime = now.toISOString().slice(0, 16);
    const currentDate = now.toISOString().slice(0, 10);
    
    document.getElementById('permit-borrow-datetime').value = currentDateTime;
    document.getElementById('handover-datetime').value = currentDateTime;
    document.getElementById('return-datetime').value = currentDateTime;
    document.getElementById('tool-maintenance').value = currentDate;
    
    // Show/hide technician select based on borrow source
    document.getElementById('permit-source').addEventListener('change', function() {
        const technicianRow = document.getElementById('technician-source-row');
        technicianRow.style.display = this.value === 'technician' ? 'block' : 'none';
    });
    
    // Show/hide technician select based on return destination
    document.getElementById('return-destination').addEventListener('change', function() {
        const technicianRow = document.getElementById('return-technician-row');
        technicianRow.style.display = this.value === 'technician' ? 'block' : 'none';
    });
    
    // Modal open/close functionality
    const modals = document.querySelectorAll('.modal');
    const closeButtons = document.querySelectorAll('.close-btn, .btn-cancel');
    
    // Function to open modal
    function openModal(modalId) {
        document.getElementById(modalId).style.display = 'flex';
    }
    
    // Function to close modal
    function closeModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
    }
    
    // Open modal for adding new tool
    document.getElementById('btn-add-tool').addEventListener('click', () => {
        // Reset form
        document.getElementById('modal-tool-title').textContent = 'Add New Tool';
        document.getElementById('tool-id').value = '';
        document.getElementById('tool-name').value = '';
        document.getElementById('tool-category').value = 'power';
        document.getElementById('tool-quantity').value = '1';
        document.getElementById('tool-condition').value = 'excellent';
        document.getElementById('tool-maintenance').value = currentDate;
        document.getElementById('tool-notes').value = '';
        
        openModal('tool-modal');
    });
    
    // Open modal for adding permit tools
    document.getElementById('btn-add-permit-tools').addEventListener('click', () => {
        openModal('select-tools-modal');
    });
    
    // Open modal for adding handover tools
    document.getElementById('btn-add-handover-tools').addEventListener('click', () => {
        openModal('select-tools-modal');
    });
    
    // Open modal for adding return tools
    document.getElementById('btn-add-return-tools').addEventListener('click', () => {
        openModal('select-tools-modal');
    });
    
    // Close modals when clicking close button or cancel button
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                closeModal(modal.id);
            }
        });
    });
    
    // Close modal when clicking outside modal content
    modals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal(this.id);
            }
        });
    });
    
    // Edit tool button functionality
    document.querySelectorAll('.btn-action.edit').forEach(button => {
        button.addEventListener('click', function() {
            const row = this.closest('tr');
            document.getElementById('modal-tool-title').textContent = 'Edit Tool';
            document.getElementById('tool-id').value = row.cells[0].textContent;
            document.getElementById('tool-name').value = row.cells[1].textContent;
            document.getElementById('tool-category').value = row.cells[2].textContent.toLowerCase().includes('power') ? 'power' : 
                                                           row.cells[2].textContent.toLowerCase().includes('hand') ? 'hand' : 'other';
            document.getElementById('tool-quantity').value = row.cells[3].textContent;
            
            const condition = row.cells[6].querySelector('.status-badge').textContent.toLowerCase();
            document.getElementById('tool-condition').value = condition.includes('excellent') ? 'excellent' :
                                                             condition.includes('good') ? 'good' : 'fair';
            
            document.getElementById('tool-maintenance').value = row.cells[7].textContent;
            document.getElementById('tool-notes').value = ''; // You might want to add notes field to your table
            
            openModal('tool-modal');
        });
    });
    
    // Delete tool button functionality
    document.querySelectorAll('.btn-action.delete').forEach(button => {
        button.addEventListener('click', function() {
            if (confirm('Are you sure you want to delete this tool?')) {
                const row = this.closest('tr');
                row.remove();
                // Here you would typically make an AJAX call to delete from database
                alert('Tool deleted successfully');
            }
        });
    });
    
    // Approve/Reject buttons functionality
    document.querySelectorAll('.btn-action.approve, .btn-action.reject').forEach(button => {
        button.addEventListener('click', function() {
            const isApprove = this.classList.contains('approve');
            const row = this.closest('tr');
            
            if (isApprove) {
                // Update status to approved
                const statusCell = row.querySelector('.status-badge');
                statusCell.textContent = 'Approved';
                statusCell.className = 'status-badge excellent';
                
                // Remove action buttons
                const actionsCell = row.cells[row.cells.length - 1];
                actionsCell.innerHTML = '<span>Approved</span>';
                
                alert('Request approved successfully');
            } else {
                // Remove the row for reject
                row.remove();
                alert('Request rejected');
            }
        });
    });
    
    // Save tool functionality
    document.getElementById('tool-save').addEventListener('click', function() {
        const toolId = document.getElementById('tool-id').value;
        const isEdit = toolId !== '';
        
        // Get form values
        const name = document.getElementById('tool-name').value;
        const category = document.getElementById('tool-category').value;
        const quantity = document.getElementById('tool-quantity').value;
        const condition = document.getElementById('tool-condition').value;
        const maintenance = document.getElementById('tool-maintenance').value;
        const notes = document.getElementById('tool-notes').value;
        
        // Simple validation
        if (!name) {
            alert('Please enter tool name');
            return;
        }
        
        if (isEdit) {
            // Update existing row
            const rows = document.querySelectorAll('#stock-tools-body tr');
            for (let row of rows) {
                if (row.cells[0].textContent === toolId) {
                    row.cells[1].textContent = name;
                    row.cells[2].textContent = category === 'power' ? 'Power Tools' : 
                                              category === 'hand' ? 'Hand Tools' : 
                                              category === 'measurement' ? 'Measurement' : 
                                              category === 'ppe' ? 'PPE' : 'Other';
                    row.cells[3].textContent = quantity;
                    
                    // Update condition badge
                    const conditionBadge = row.cells[6].querySelector('.status-badge');
                    conditionBadge.textContent = condition === 'excellent' ? 'Excellent' : 
                                                condition === 'good' ? 'Good' : 
                                                condition === 'fair' ? 'Fair' : 'Poor';
                    conditionBadge.className = 'status-badge ' + 
                                             (condition === 'excellent' ? 'excellent' : 
                                              condition === 'good' ? 'good' : 'pending');
                    
                    row.cells[7].textContent = maintenance;
                    break;
                }
            }
            
            alert('Tool updated successfully');
        } else {
            // Add new row
            const tbody = document.getElementById('stock-tools-body');
            const newRow = tbody.insertRow();
            
            const rowId = tbody.rows.length + 1;
            
            newRow.innerHTML = `
                <td>${rowId}</td>
                <td>${name}</td>
                <td>${category === 'power' ? 'Power Tools' : 
                     category === 'hand' ? 'Hand Tools' : 
                     category === 'measurement' ? 'Measurement' : 
                     category === 'ppe' ? 'PPE' : 'Other'}</td>
                <td>${quantity}</td>
                <td>${quantity}</td>
                <td>0</td>
                <td><span class="status-badge ${condition === 'excellent' ? 'excellent' : 
                                              condition === 'good' ? 'good' : 'pending'}">
                    ${condition === 'excellent' ? 'Excellent' : 
                      condition === 'good' ? 'Good' : 
                      condition === 'fair' ? 'Fair' : 'Poor'}
                </span></td>
                <td>${maintenance}</td>
                <td>
                    <button class="btn-action edit"><i class="fas fa-edit"></i></button>
                    <button class="btn-action delete"><i class="fas fa-trash"></i></button>
                </td>
            `;
            
            // Add event listeners to new buttons
            newRow.querySelector('.btn-action.edit').addEventListener('click', function() {
                const row = this.closest('tr');
                document.getElementById('modal-tool-title').textContent = 'Edit Tool';
                document.getElementById('tool-id').value = row.cells[0].textContent;
                document.getElementById('tool-name').value = row.cells[1].textContent;
                document.getElementById('tool-category').value = row.cells[2].textContent.toLowerCase().includes('power') ? 'power' : 
                                                               row.cells[2].textContent.toLowerCase().includes('hand') ? 'hand' : 'other';
                document.getElementById('tool-quantity').value = row.cells[3].textContent;
                
                const condition = row.cells[6].querySelector('.status-badge').textContent.toLowerCase();
                document.getElementById('tool-condition').value = condition.includes('excellent') ? 'excellent' :
                                                                 condition.includes('good') ? 'good' : 'fair';
                
                document.getElementById('tool-maintenance').value = row.cells[7].textContent;
                document.getElementById('tool-notes').value = '';
                
                openModal('tool-modal');
            });
            
            newRow.querySelector('.btn-action.delete').addEventListener('click', function() {
                if (confirm('Are you sure you want to delete this tool?')) {
                    const row = this.closest('tr');
                    row.remove();
                    alert('Tool deleted successfully');
                }
            });
            
            alert('Tool added successfully');
        }
        
        closeModal('tool-modal');
    });
    
    // Select tools functionality
    document.getElementById('select-tools-confirm').addEventListener('click', function() {
        const selectedTools = [];
        const checkboxes = document.querySelectorAll('.tool-checkbox:checked');
        
        checkboxes.forEach(checkbox => {
            selectedTools.push({
                id: checkbox.getAttribute('data-id'),
                name: checkbox.getAttribute('data-name'),
                category: checkbox.getAttribute('data-category')
            });
        });
        
        if (selectedTools.length === 0) {
            alert('Please select at least one tool');
            return;
        }
        
        // Determine which form we're adding tools to
        let targetContainer;
        if (document.getElementById('permit-selected-tools').closest('.modal') === null) {
            targetContainer = document.getElementById('permit-selected-tools');
        } else if (document.getElementById('handover-selected-tools').closest('.modal') === null) {
            targetContainer = document.getElementById('handover-selected-tools');
        } else {
            targetContainer = document.getElementById('return-selected-tools');
        }
        
        // Clear previous selections
        targetContainer.innerHTML = '';
        
        // Add selected tools
        selectedTools.forEach(tool => {
            const toolElement = document.createElement('div');
            toolElement.className = 'selected-tool-item';
            toolElement.innerHTML = `
                <span>${tool.name} (${tool.category})</span>
                <button class="btn-action delete" data-id="${tool.id}">
                    <i class="fas fa-times"></i>
                </button>
            `;
            targetContainer.appendChild(toolElement);
            
            // Add event listener to remove button
            toolElement.querySelector('.btn-action.delete').addEventListener('click', function() {
                toolElement.remove();
            });
        });
        
        closeModal('select-tools-modal');
    });
    
    // Form submission handlers
    document.getElementById('permit-submit').addEventListener('click', function() {
        const technician = document.getElementById('permit-technician').value;
        const source = document.getElementById('permit-source').value;
        const tools = document.getElementById('permit-selected-tools').children;
        const borrowDate = document.getElementById('permit-borrow-datetime').value;
        const notes = document.getElementById('permit-notes').value;
        
        if (!technician || tools.length === 0) {
            alert('Please fill all required fields');
            return;
        }
        
        // Get technician name
        const technicianName = document.getElementById('permit-technician').options[
            document.getElementById('permit-technician').selectedIndex
        ].text;
        
        // Get tools list
        let toolsList = [];
        for (let tool of tools) {
            toolsList.push(tool.querySelector('span').textContent.split(' (')[0]);
        }
        
        // Add to pending approvals table
        const tbody = document.getElementById('permit-pending-body');
        const newRow = tbody.insertRow();
        
        const requestId = 'REQ-' + (tbody.rows.length + 1).toString().padStart(3, '0');
        
        newRow.innerHTML = `
            <td>${requestId}</td>
            <td>${technicianName}</td>
            <td>${toolsList.join(', ')}</td>
            <td>${borrowDate.split('T')[0]}</td>
            <td><span class="status-badge pending">Pending</span></td>
            <td>
                <button class="btn-action approve"><i class="fas fa-check"></i> Approve</button>
                <button class="btn-action reject"><i class="fas fa-times"></i> Reject</button>
            </td>
        `;
        
        // Add event listeners to new buttons
        newRow.querySelector('.btn-action.approve').addEventListener('click', function() {
            const row = this.closest('tr');
            const statusCell = row.querySelector('.status-badge');
            statusCell.textContent = 'Approved';
            statusCell.className = 'status-badge excellent';
            
            const actionsCell = row.cells[row.cells.length - 1];
            actionsCell.innerHTML = '<span>Approved</span>';
            
            alert('Request approved successfully');
        });
        
        newRow.querySelector('.btn-action.reject').addEventListener('click', function() {
            const row = this.closest('tr');
            row.remove();
            alert('Request rejected');
        });
        
        // Reset form
        document.getElementById('permit-technician').value = '';
        document.getElementById('permit-selected-tools').innerHTML = '';
        document.getElementById('permit-notes').value = '';
        
        alert('Borrowing request submitted successfully');
    });
    
    // Handover form submission
    document.getElementById('handover-submit').addEventListener('click', function() {
        const fromTechnician = document.getElementById('handover-from').value;
        const toTechnician = document.getElementById('handover-to').value;
        const tools = document.getElementById('handover-selected-tools').children;
        const handoverDate = document.getElementById('handover-datetime').value;
        const notes = document.getElementById('handover-notes').value;
        
        if (!fromTechnician || !toTechnician || tools.length === 0) {
            alert('Please fill all required fields');
            return;
        }
        
        // Get technician names
        const fromName = document.getElementById('handover-from').options[
            document.getElementById('handover-from').selectedIndex
        ].text;
        
        const toName = document.getElementById('handover-to').options[
            document.getElementById('handover-to').selectedIndex
        ].text;
        
        // Get tools list
        let toolsList = [];
        for (let tool of tools) {
            toolsList.push(tool.querySelector('span').textContent.split(' (')[0]);
        }
        
        // Add to pending handovers table
        const tbody = document.getElementById('handover-pending-body');
        const newRow = tbody.insertRow();
        
        const requestId = 'HOV-' + (tbody.rows.length + 1).toString().padStart(3, '0');
        
        newRow.innerHTML = `
            <td>${requestId}</td>
            <td>${fromName}</td>
            <td>${toName}</td>
            <td>${toolsList.join(', ')}</td>
            <td>${handoverDate.split('T')[0]}</td>
            <td><span class="status-badge pending">Pending</span></td>
            <td>
                <button class="btn-action approve"><i class="fas fa-check"></i> Approve</button>
                <button class="btn-action reject"><i class="fas fa-times"></i> Reject</button>
            </td>
        `;
        
        // Add event listeners to new buttons
        newRow.querySelector('.btn-action.approve').addEventListener('click', function() {
            const row = this.closest('tr');
            const statusCell = row.querySelector('.status-badge');
            statusCell.textContent = 'Approved';
            statusCell.className = 'status-badge excellent';
            
            const actionsCell = row.cells[row.cells.length - 1];
            actionsCell.innerHTML = '<span>Approved</span>';
            
            alert('Handover approved successfully');
        });
        
        newRow.querySelector('.btn-action.reject').addEventListener('click', function() {
            const row = this.closest('tr');
            row.remove();
            alert('Handover rejected');
        });
        
        // Reset form
        document.getElementById('handover-from').value = '';
        document.getElementById('handover-to').value = '';
        document.getElementById('handover-selected-tools').innerHTML = '';
        document.getElementById('handover-notes').value = '';
        
        alert('Handover request submitted successfully');
    });
    
    // Return form submission
    document.getElementById('return-submit').addEventListener('click', function() {
        const destination = document.getElementById('return-destination').value;
        const technician = destination === 'technician' ? document.getElementById('return-technician').value : null;
        const tools = document.getElementById('return-selected-tools').children;
        const returnDate = document.getElementById('return-datetime').value;
        const condition = document.getElementById('return-condition').value;
        const notes = document.getElementById('return-notes').value;
        
        if (tools.length === 0) {
            alert('Please select at least one tool to return');
            return;
        }
        
        // Get technician name if returning to technician
        let technicianName = 'Inventory';
        if (destination === 'technician' && technician) {
            technicianName = document.getElementById('return-technician').options[
                document.getElementById('return-technician').selectedIndex
            ].text;
        }
        
        // Get tools list
        let toolsList = [];
        for (let tool of tools) {
            toolsList.push(tool.querySelector('span').textContent.split(' (')[0]);
        }
        
        // Add to pending returns table
        const tbody = document.getElementById('return-pending-body');
        const newRow = tbody.insertRow();
        
        const requestId = 'RET-' + (tbody.rows.length + 1).toString().padStart(3, '0');
        
        newRow.innerHTML = `
            <td>${requestId}</td>
            <td>John Doe</td> <!-- Assuming current user is returning -->
            <td>${technicianName}</td>
            <td>${toolsList.join(', ')}</td>
            <td>${returnDate.split('T')[0]}</td>
            <td><span class="status-badge pending">Pending</span></td>
            <td>
                <button class="btn-action approve"><i class="fas fa-check"></i> Approve</button>
                <button class="btn-action reject"><i class="fas fa-times"></i> Reject</button>
            </td>
        `;
        
        // Add event listeners to new buttons
        newRow.querySelector('.btn-action.approve').addEventListener('click', function() {
            const row = this.closest('tr');
            const statusCell = row.querySelector('.status-badge');
            statusCell.textContent = 'Approved';
            statusCell.className = 'status-badge excellent';
            
            const actionsCell = row.cells[row.cells.length - 1];
            actionsCell.innerHTML = '<span>Approved</span>';
            
            alert('Return approved successfully');
        });
        
        newRow.querySelector('.btn-action.reject').addEventListener('click', function() {
            const row = this.closest('tr');
            row.remove();
            alert('Return rejected');
        });
        
        // Reset form
        document.getElementById('return-destination').value = 'inventory';
        document.getElementById('return-technician-row').style.display = 'none';
        document.getElementById('return-selected-tools').innerHTML = '';
        document.getElementById('return-condition').value = 'excellent';
        document.getElementById('return-notes').value = '';
        
        alert('Return request submitted successfully');
    });
    
    // Search functionality for tables
    function setupTableSearch(inputId, tableBodyId) {
        document.getElementById(inputId).addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const rows = document.querySelectorAll(`#${tableBodyId} tr`);
            
            rows.forEach(row => {
                const rowText = row.textContent.toLowerCase();
                row.style.display = rowText.includes(searchTerm) ? '' : 'none';
            });
        });
    }
    
    // Set up search for all tables
    setupTableSearch('borrowed-search', 'borrowed-tools-body');
    setupTableSearch('stock-search', 'stock-tools-body');
    setupTableSearch('permit-pending-search', 'permit-pending-body');
    setupTableSearch('handover-pending-search', 'handover-pending-body');
    setupTableSearch('return-pending-search', 'return-pending-body');
    setupTableSearch('modal-tools-search', 'modal-tools-list');
});