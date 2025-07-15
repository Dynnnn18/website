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
});