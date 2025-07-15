document.addEventListener('DOMContentLoaded', function() {
    // Hamburger menu functionality
    const hamburger = document.querySelector('.hamburger');
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    document.body.appendChild(overlay);

    // Toggle sidebar
    function toggleSidebar() {
        hamburger.classList.toggle('active');
        sidebar.classList.toggle('active');
        overlay.style.display = sidebar.classList.contains('active') ? 'block' : 'none';
        document.body.style.overflow = sidebar.classList.contains('active') ? 'hidden' : 'auto';
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
                document.body.style.overflow = 'auto';
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
            document.body.style.overflow = 'auto';
        }
    });

    // Modal elements
    const newProjectModal = document.getElementById('newProjectModal');
    const progressModal = document.getElementById('progressModal');
    const progressListModal = document.getElementById('progressListModal');
    const newProjectBtn = document.getElementById('newProjectBtn');
    const closeBtns = document.querySelectorAll('.close-btn');
    const viewProgressBtns = document.querySelectorAll('.view-progress-btn');
    const addProgressBtns = document.querySelectorAll('.add-progress-btn');
    
    // Initialize date and time pickers
    if (document.querySelector('.datepicker')) {
        flatpickr('.datepicker', {
            dateFormat: 'Y-m-d',
            defaultDate: 'today'
        });
    }
    
    if (document.querySelector('.timepicker')) {
        flatpickr('.timepicker', {
            enableTime: true,
            noCalendar: true,
            dateFormat: 'H:i',
            time_24hr: true
        });
    }
    
    // New Project Button Click
    if (newProjectBtn) {
        newProjectBtn.addEventListener('click', function() {
            newProjectModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        });
    }
    
    // View Progress Buttons
    viewProgressBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            progressListModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        });
    });
    
    // Add Progress Buttons
    addProgressBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            progressModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        });
    });
    
    // Close Modal Buttons
    closeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    });
    
    // Close modal when clicking outside
    [newProjectModal, progressModal, progressListModal].forEach(modal => {
        if (modal) {
            modal.addEventListener('click', function(e) {
                if (e.target === this) {
                    this.style.display = 'none';
                    document.body.style.overflow = 'auto';
                }
            });
        }
    });
    
    // File upload preview
    const fileUpload = document.getElementById('progressPhotos');
    if (fileUpload) {
        fileUpload.addEventListener('change', function() {
            const preview = document.getElementById('filePreview');
            preview.innerHTML = '';
            
            if (this.files) {
                Array.from(this.files).forEach(file => {
                    const reader = new FileReader();
                    
                    reader.onload = function(e) {
                        const div = document.createElement('div');
                        div.className = 'photo-thumbnail';
                        
                        const img = document.createElement('img');
                        img.src = e.target.result;
                        img.alt = 'Preview';
                        
                        div.appendChild(img);
                        preview.appendChild(div);
                    }
                    
                    reader.readAsDataURL(file);
                });
            }
        });
    }
    
    // Form submissions
    const projectForm = document.getElementById('projectForm');
    if (projectForm) {
        projectForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Project created successfully!');
            this.reset();
            newProjectModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }
    
    const progressForm = document.getElementById('progressForm');
    if (progressForm) {
        progressForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Progress report saved successfully!');
            this.reset();
            document.getElementById('filePreview').innerHTML = '';
            progressModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }
    
    // Prevent modal from closing when clicking inside modal content
    document.querySelectorAll('.modal-content').forEach(content => {
        content.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    });
});