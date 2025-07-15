document.addEventListener('DOMContentLoaded', function() {
    // Attendance status
    let hasCheckedIn = localStorage.getItem('hasCheckedIn') === 'true';
    let hasSubmittedActivity = localStorage.getItem('hasSubmittedActivity') === 'true';
    let hasCheckedOut = localStorage.getItem('hasCheckedOut') === 'true';
    let checkinStream = null;
    let checkoutStream = null;
    let activityPhotos = []; // Array to hold all selected activity photos
    
    // Initialize UI
    function initAttendanceUI() {
        // Check-in status
        if (hasCheckedIn) {
            document.getElementById('checkin-form').style.display = 'none';
            document.getElementById('checkin-success').style.display = 'block';
            document.getElementById('checkout-not-allowed').style.display = 'none';
            document.getElementById('activity-required').style.display = 'none';
            document.getElementById('activity-form-container').style.display = 'block';
            
            // Show check-in details
            const checkinTime = localStorage.getItem('checkinTime');
            const todayPlan = localStorage.getItem('todayPlan');
            
            document.getElementById('checkin-time').textContent = checkinTime || '';
            document.getElementById('checkin-details').innerHTML = `
                <h4>Rencana Kerja Anda:</h4>
                <p>${todayPlan || ''}</p>
            `;
            
            // Activity status
            if (hasSubmittedActivity) {
                document.getElementById('activity-form-container').style.display = 'none';
                document.getElementById('activity-submitted').style.display = 'block';
                document.getElementById('checkout-pending').style.display = 'none';
                document.getElementById('checkout-form').style.display = 'block';
                
                // Show activity details
                const activityTime = localStorage.getItem('activityTime');
                const activityDesc = localStorage.getItem('activityDescription');
                
                document.getElementById('activity-time').textContent = activityTime || '';
                document.getElementById('activity-details').innerHTML = `
                    <h4>Detail Aktivitas:</h4>
                    <p>${activityDesc || ''}</p>
                `;
                
                // Show submitted photos if they exist
                const savedPhotos = localStorage.getItem('activityPhotos');
                if (savedPhotos) {
                    const submittedPhotosContainer = document.getElementById('submitted-photos-container');
                    submittedPhotosContainer.innerHTML = '';
                    
                    const photosTitle = document.createElement('div');
                    photosTitle.className = 'submitted-photos-title';
                    photosTitle.textContent = 'Foto Aktivitas:';
                    submittedPhotosContainer.appendChild(photosTitle);
                    
                    const photosGrid = document.createElement('div');
                    photosGrid.className = 'submitted-photos-grid';
                    
                    JSON.parse(savedPhotos).forEach(photo => {
                        const photoItem = document.createElement('div');
                        photoItem.className = 'submitted-photo-item';
                        photoItem.innerHTML = `<img src="${photo.data}" alt="Aktivitas Foto">`;
                        photosGrid.appendChild(photoItem);
                    });
                    
                    submittedPhotosContainer.appendChild(photosGrid);
                }
            } else {
                document.getElementById('activity-form-container').style.display = 'block';
                document.getElementById('activity-submitted').style.display = 'none';
                document.getElementById('checkout-pending').style.display = 'block';
                document.getElementById('checkout-form').style.display = 'none';
            }
            
            // Check-out status
            if (hasCheckedOut) {
                document.getElementById('checkout-form').style.display = 'none';
                document.getElementById('checkout-success').style.display = 'block';
                document.getElementById('checkout-time').textContent = localStorage.getItem('checkoutTime') || '';
            }
        } else {
            document.getElementById('checkin-form').style.display = 'block';
            document.getElementById('checkin-success').style.display = 'none';
            document.getElementById('activity-required').style.display = 'block';
            document.getElementById('activity-form-container').style.display = 'none';
            document.getElementById('activity-submitted').style.display = 'none';
            document.getElementById('checkout-not-allowed').style.display = 'block';
            document.getElementById('checkout-form').style.display = 'none';
            document.getElementById('checkout-pending').style.display = 'none';
            document.getElementById('checkout-success').style.display = 'none';
        }
    }
    
    // Reset attendance
    document.getElementById('resetAttendance').addEventListener('click', function() {
        if (confirm('Apakah Anda yakin ingin mereset absensi hari ini?')) {
            localStorage.removeItem('hasCheckedIn');
            localStorage.removeItem('hasSubmittedActivity');
            localStorage.removeItem('hasCheckedOut');
            localStorage.removeItem('todayPlan');
            localStorage.removeItem('checkinTime');
            localStorage.removeItem('activityDescription');
            localStorage.removeItem('activityTime');
            localStorage.removeItem('checkoutTime');
            localStorage.removeItem('activityPhotos');
            
            hasCheckedIn = false;
            hasSubmittedActivity = false;
            hasCheckedOut = false;
            activityPhotos = [];
            
            // Reset forms
            document.getElementById('checkinForm').reset();
            document.getElementById('activityForm').reset();
            document.getElementById('checkoutForm').reset();
            document.getElementById('checkinPhotoPreview').innerHTML = '';
            document.getElementById('activityPhotosPreview').innerHTML = '';
            document.getElementById('checkoutPhotoPreview').innerHTML = '';
            document.getElementById('submitted-photos-container').innerHTML = '';
            
            // Close cameras
            if (checkinStream) {
                checkinStream.getTracks().forEach(track => track.stop());
                checkinStream = null;
            }
            if (checkoutStream) {
                checkoutStream.getTracks().forEach(track => track.stop());
                checkoutStream = null;
            }
            
            document.getElementById('checkinCameraContainer').style.display = 'none';
            document.getElementById('checkoutCameraContainer').style.display = 'none';
            
            initAttendanceUI();
            alert('Absensi hari ini telah direset.');
        }
    });
    
    // Check-in camera
    document.getElementById('openCameraCheckin').addEventListener('click', async function() {
        try {
            checkinStream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'user' }, 
                audio: false 
            });
            document.getElementById('checkinCameraView').srcObject = checkinStream;
            document.getElementById('checkinCameraContainer').style.display = 'block';
        } catch (err) {
            alert('Error accessing camera: ' + err.message);
        }
    });
    
    document.getElementById('captureCheckin').addEventListener('click', function() {
        const video = document.getElementById('checkinCameraView');
        const canvas = document.getElementById('checkinCanvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);
        
        const imageData = canvas.toDataURL('image/jpeg');
        document.getElementById('checkinPhotoData').value = imageData;
        document.getElementById('checkinPhotoPreview').innerHTML = '<img src="' + imageData + '">';
        
        checkinStream.getTracks().forEach(track => track.stop());
        document.getElementById('checkinCameraContainer').style.display = 'none';
    });
    
    document.getElementById('cancelCheckin').addEventListener('click', function() {
        if (checkinStream) {
            checkinStream.getTracks().forEach(track => track.stop());
            checkinStream = null;
        }
        document.getElementById('checkinCameraContainer').style.display = 'none';
    });
    
    // Check-in file upload
    document.getElementById('checkinPhotoFile').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                document.getElementById('checkinPhotoPreview').innerHTML = '<img src="' + event.target.result + '">';
                document.getElementById('checkinPhotoData').value = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Activity photo upload - Accumulating photos
    document.getElementById('activityPhotoFile').addEventListener('change', function(e) {
        const photosPreview = document.getElementById('activityPhotosPreview');
        
        // Process all newly selected files
        Array.from(e.target.files).forEach((file, index) => {
            if (!file.type.match('image.*')) return;
            
            const reader = new FileReader();
            reader.onload = function(event) {
                // Add the new photo to our array
                const photoObj = {
                    id: Date.now() + index, // Unique ID for each photo
                    data: event.target.result
                };
                activityPhotos.push(photoObj);
                
                // Create preview element
                const previewDiv = document.createElement('div');
                previewDiv.className = 'photo-preview-item';
                previewDiv.dataset.id = photoObj.id;
                previewDiv.innerHTML = `
                    <img src="${photoObj.data}" alt="Preview">
                    <button class="remove-photo" data-id="${photoObj.id}">&times;</button>
                `;
                photosPreview.appendChild(previewDiv);
                
                // Add remove button functionality
                previewDiv.querySelector('.remove-photo').addEventListener('click', function() {
                    const photoId = parseInt(this.dataset.id);
                    // Remove from array
                    activityPhotos = activityPhotos.filter(photo => photo.id !== photoId);
                    // Remove from DOM
                    document.querySelector(`.photo-preview-item[data-id="${photoId}"]`).remove();
                });
            };
            reader.readAsDataURL(file);
        });
        
        // Reset file input to allow selecting same files again
        e.target.value = '';
    });
    
    // Check-out camera
    document.getElementById('openCameraCheckout').addEventListener('click', async function() {
        try {
            checkoutStream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'user' }, 
                audio: false 
            });
            document.getElementById('checkoutCameraView').srcObject = checkoutStream;
            document.getElementById('checkoutCameraContainer').style.display = 'block';
        } catch (err) {
            alert('Error accessing camera: ' + err.message);
        }
    });
    
    document.getElementById('captureCheckout').addEventListener('click', function() {
        const video = document.getElementById('checkoutCameraView');
        const canvas = document.getElementById('checkoutCanvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);
        
        const imageData = canvas.toDataURL('image/jpeg');
        document.getElementById('checkoutPhotoData').value = imageData;
        document.getElementById('checkoutPhotoPreview').innerHTML = '<img src="' + imageData + '">';
        
        checkoutStream.getTracks().forEach(track => track.stop());
        document.getElementById('checkoutCameraContainer').style.display = 'none';
    });
    
    document.getElementById('cancelCheckout').addEventListener('click', function() {
        if (checkoutStream) {
            checkoutStream.getTracks().forEach(track => track.stop());
            checkoutStream = null;
        }
        document.getElementById('checkoutCameraContainer').style.display = 'none';
    });
    
    // Check-out file upload
    document.getElementById('checkoutPhotoFile').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                document.getElementById('checkoutPhotoPreview').innerHTML = '<img src="' + event.target.result + '">';
                document.getElementById('checkoutPhotoData').value = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Form submissions
    document.getElementById('checkinForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (!document.getElementById('checkinPhotoData').value && !document.getElementById('checkinPhotoFile').files[0]) {
            alert('Silakan ambil atau upload foto terlebih dahulu');
            return;
        }
        
        const now = new Date();
        const submitTime = now.toLocaleString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        
        const todayPlan = document.getElementById('today_plan').value;
        localStorage.setItem('hasCheckedIn', 'true');
        localStorage.setItem('todayPlan', todayPlan);
        localStorage.setItem('checkinTime', submitTime);
        hasCheckedIn = true;
        
        initAttendanceUI();
        alert('Absensi masuk berhasil!');
    });
    
    document.getElementById('activityForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (!document.getElementById('activityDescription').value.trim()) {
            alert('Harap isi deskripsi aktivitas');
            return;
        }
        
        if (activityPhotos.length === 0) {
            alert('Harap tambahkan minimal 1 foto aktivitas');
            return;
        }
        
        const now = new Date();
        const submitTime = now.toLocaleString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        
        const activityDesc = document.getElementById('activityDescription').value;
        localStorage.setItem('hasSubmittedActivity', 'true');
        localStorage.setItem('activityDescription', activityDesc);
        localStorage.setItem('activityTime', submitTime);
        
        // Store photos data
        localStorage.setItem('activityPhotos', JSON.stringify(activityPhotos));
        hasSubmittedActivity = true;
        
        document.getElementById('activity-form-container').style.display = 'none';
        document.getElementById('activity-submitted').style.display = 'block';
        document.getElementById('activity-time').textContent = submitTime;
        document.getElementById('activity-details').innerHTML = `
            <h4>Detail Aktivitas:</h4>
            <p>${activityDesc}</p>
        `;
        
        // Display submitted photos
        const submittedPhotosContainer = document.getElementById('submitted-photos-container');
        submittedPhotosContainer.innerHTML = '';
        
        if (activityPhotos.length > 0) {
            const photosTitle = document.createElement('div');
            photosTitle.className = 'submitted-photos-title';
            photosTitle.textContent = 'Foto Aktivitas:';
            submittedPhotosContainer.appendChild(photosTitle);
            
            const photosGrid = document.createElement('div');
            photosGrid.className = 'submitted-photos-grid';
            
            activityPhotos.forEach(photo => {
                const photoItem = document.createElement('div');
                photoItem.className = 'submitted-photo-item';
                photoItem.innerHTML = `<img src="${photo.data}" alt="Aktivitas Foto">`;
                photosGrid.appendChild(photoItem);
            });
            
            submittedPhotosContainer.appendChild(photosGrid);
        }
        
        document.getElementById('checkout-pending').style.display = 'none';
        document.getElementById('checkout-form').style.display = 'block';
        
        alert('Aktivitas harian berhasil dikirim!');
    });
    
    document.getElementById('checkoutForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (!document.getElementById('checkoutPhotoData').value && !document.getElementById('checkoutPhotoFile').files[0]) {
            alert('Silakan ambil atau upload foto terlebih dahulu');
            return;
        }
        
        const now = new Date();
        const submitTime = now.toLocaleString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        
        localStorage.setItem('hasCheckedOut', 'true');
        localStorage.setItem('checkoutTime', submitTime);
        hasCheckedOut = true;
        
        initAttendanceUI();
        alert('Absensi pulang berhasil!');
    });
    
    // Initialize
    initAttendanceUI();
    
    // Load any previously saved activity photos
    const savedPhotos = localStorage.getItem('activityPhotos');
    if (savedPhotos && document.getElementById('activityPhotosPreview')) {
        activityPhotos = JSON.parse(savedPhotos);
        const photosPreview = document.getElementById('activityPhotosPreview');
        photosPreview.innerHTML = '';
        
        activityPhotos.forEach(photo => {
            const previewDiv = document.createElement('div');
            previewDiv.className = 'photo-preview-item';
            previewDiv.dataset.id = photo.id;
            previewDiv.innerHTML = `
                <img src="${photo.data}" alt="Preview">
                <button class="remove-photo" data-id="${photo.id}">&times;</button>
            `;
            photosPreview.appendChild(previewDiv);
            
            // Add remove button functionality
            previewDiv.querySelector('.remove-photo').addEventListener('click', function() {
                const photoId = parseInt(this.dataset.id);
                activityPhotos = activityPhotos.filter(p => p.id !== photoId);
                document.querySelector(`.photo-preview-item[data-id="${photoId}"]`).remove();
            });
        });
    }
});