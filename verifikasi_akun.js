document.addEventListener('DOMContentLoaded', function() {
  // Hamburger menu functionality
  const hamburger = document.querySelector('.hamburger');
  const sidebar = document.querySelector('.sidebar');
  const mainContent = document.querySelector('.main-content');
  const overlay = document.createElement('div');
  
  // Create overlay element
  overlay.className = 'overlay';
  document.body.appendChild(overlay);
  
  // Toggle sidebar
  function toggleSidebar() {
    hamburger.classList.toggle('active');
    sidebar.classList.toggle('active');
    overlay.style.display = sidebar.classList.contains('active') ? 'block' : 'none';
  }
  
  // Hamburger click event
  hamburger.addEventListener('click', toggleSidebar);
  
  // Overlay click event
  overlay.addEventListener('click', toggleSidebar);
  
  // Close sidebar when clicking outside on mobile
  document.addEventListener('click', function(e) {
    if (window.innerWidth <= 992) {
      if (!sidebar.contains(e.target) && !hamburger.contains(e.target)) {
        hamburger.classList.remove('active');
        sidebar.classList.remove('active');
        overlay.style.display = 'none';
      }
    }
  });

  // Prevent sidebar from closing when clicking inside it
  sidebar.addEventListener('click', function(e) {
    e.stopPropagation();
  });
  
  // Window resize event
  window.addEventListener('resize', function() {
    if (window.innerWidth > 992) {
      sidebar.classList.remove('active');
      hamburger.classList.remove('active');
      overlay.style.display = 'none';
    }
  });

  // Toggle password visibility in form
  const togglePassword = document.getElementById('toggle-password');
  const passwordInput = document.getElementById('password');
  
  if (togglePassword && passwordInput) {
    togglePassword.addEventListener('click', function() {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      this.classList.toggle('fa-eye-slash');
      this.classList.toggle('fa-eye');
    });
  }

  // Toggle password visibility in table
  document.querySelectorAll('.toggle-password-visibility').forEach(icon => {
    icon.addEventListener('click', function() {
      const passwordField = this.closest('.password-field');
      const passwordText = passwordField.querySelector('.password-text');
      
      if (passwordText.style.webkitTextSecurity === 'none') {
        passwordText.style.webkitTextSecurity = 'disc';
        this.classList.remove('fa-eye-slash');
        this.classList.add('fa-eye');
      } else {
        passwordText.style.webkitTextSecurity = 'none';
        this.classList.remove('fa-eye');
        this.classList.add('fa-eye-slash');
      }
    });
  });

  // Form submission handler
  const accountForm = document.getElementById('account-form');
  if (accountForm) {
    accountForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Get form values
      const fullName = document.getElementById('full-name').value;
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      const role = document.getElementById('role').value;
      
      // In a real application, you would make an AJAX call here to create the account
      // For demo purposes, we'll just add it to the table
      const tableBody = document.querySelector('.account-table tbody');
      const rowCount = tableBody.querySelectorAll('tr').length + 1;
      const today = new Date();
      const formattedDate = `${today.getDate()}/${today.getMonth()+1}/${today.getFullYear()}`;
      
      const newRow = document.createElement('tr');
      newRow.innerHTML = `
        <td>${rowCount}</td>
        <td>${fullName}</td>
        <td>${username}</td>
        <td>
          <div class="password-field">
            <span class="password-text">${password}</span>
            <i class="fas fa-eye toggle-password-visibility"></i>
          </div>
        </td>
        <td>${role}</td>
        <td>${formattedDate}</td>
        <td class="action-buttons">
          <button class="action-btn delete"><i class="fas fa-trash-alt"></i> Hapus</button>
        </td>
      `;
      
      tableBody.appendChild(newRow);
      
      // Add click handlers to new buttons
      newRow.querySelector('.action-btn.delete').addEventListener('click', showDeleteConfirmation);
      newRow.querySelector('.toggle-password-visibility').addEventListener('click', function() {
        const passwordField = this.closest('.password-field');
        const passwordText = passwordField.querySelector('.password-text');
        
        if (passwordText.style.webkitTextSecurity === 'none') {
          passwordText.style.webkitTextSecurity = 'disc';
          this.classList.remove('fa-eye-slash');
          this.classList.add('fa-eye');
        } else {
          passwordText.style.webkitTextSecurity = 'none';
          this.classList.remove('fa-eye');
          this.classList.add('fa-eye-slash');
        }
      });
      
      // Reset form
      this.reset();
      if (passwordInput) {
        passwordInput.setAttribute('type', 'password');
      }
      if (togglePassword) {
        togglePassword.classList.remove('fa-eye-slash');
        togglePassword.classList.add('fa-eye');
      }
      
      // Show success message
      alert('Akun berhasil ditambahkan!');
    });
  }
  
  // Delete button handler
  document.querySelectorAll('.action-btn.delete').forEach(btn => {
    btn.addEventListener('click', showDeleteConfirmation);
  });
  
  // Modal close handlers
  document.querySelectorAll('.modal-close, .cancel-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
      });
    });
  });
  
  // Confirm delete handler
  const confirmDeleteBtn = document.querySelector('.confirm-delete-btn');
  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener('click', function() {
      const modal = document.getElementById('delete-confirm-modal');
      const rowIndex = modal.dataset.rowIndex;
      
      if (rowIndex) {
        // In a real application, you would make an AJAX call here to delete the user
        const row = document.querySelector(`.account-table tbody tr:nth-child(${rowIndex})`);
        if (row) {
          row.remove();
          
          // Update row numbers
          const rows = document.querySelectorAll('.account-table tbody tr');
          rows.forEach((row, index) => {
            row.cells[0].textContent = index + 1;
          });
          
          // Show success message
          alert('Akun berhasil dihapus!');
        }
      }
      
      // Close modal
      modal.style.display = 'none';
    });
  }
  
  // Close modal when clicking outside
  window.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
      event.target.style.display = 'none';
    }
  });
  
  // Function to show delete confirmation
  function showDeleteConfirmation() {
    const row = this.closest('tr');
    if (!row) return;
    
    const cells = row.querySelectorAll('td');
    
    // Set user info in delete modal
    const deleteUserName = document.getElementById('delete-user-name');
    const deleteUserUsername = document.getElementById('delete-user-username');
    
    if (deleteUserName && deleteUserUsername) {
      deleteUserName.textContent = cells[1].textContent;
      deleteUserUsername.textContent = cells[2].textContent;
    }
    
    // Store row index for deletion
    const rowIndex = Array.from(row.parentNode.children).indexOf(row) + 1;
    const modal = document.getElementById('delete-confirm-modal');
    if (modal) {
      modal.dataset.rowIndex = rowIndex;
      modal.style.display = 'flex';
    }
  }
});