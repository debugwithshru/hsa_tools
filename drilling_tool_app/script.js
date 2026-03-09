document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const form = document.getElementById('toolForm');
    const uploadBtn = document.getElementById('uploadBtn');
    const photoInput = document.getElementById('photoUpload');
    const photoPreview = document.getElementById('photoPreview');
    const previewImg = document.getElementById('previewImg');
    const removePhotoBtn = document.getElementById('removePhotoBtn');
    const submitBtn = document.querySelector('.submit-btn');
    const successMessage = document.getElementById('successMessage');

    // Store base64 image data
    let currentPhotoBase64 = null;

    // Trigger file input when upload button is clicked
    uploadBtn.addEventListener('click', () => {
        photoInput.click();
    });

    // Handle file selection
    photoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        handleFile(file);
    });

    // Handle paste event (Ctrl+V)
    window.addEventListener('paste', (e) => {
        // Look for image in clipboard
        if (e.clipboardData && e.clipboardData.files && e.clipboardData.files.length > 0) {
            const file = e.clipboardData.files[0];
            if (file.type.startsWith('image/')) {
                e.preventDefault(); // Prevent default paste behavior

                // Add file to input so FormData picks it up
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                photoInput.files = dataTransfer.files;

                handleFile(file);
            }
        }
    });

    // Extracted logic for handling a file (used by both input change and paste)
    function handleFile(file) {
        if (file) {
            // Check if it's an image
            if (!file.type.startsWith('image/')) {
                alert('Please upload or paste an image file.');
                return;
            }

            // Create preview
            const reader = new FileReader();

            reader.onload = (e) => {
                const imgData = e.target.result;
                previewImg.src = imgData;
                currentPhotoBase64 = imgData; // Store base64 (still used for preview/validation)

                // Toggle UI
                uploadBtn.style.display = 'none';
                photoPreview.classList.remove('hidden');

                // Add appearance animation
                photoPreview.style.animation = 'slideUp 0.3s ease-out';
            };

            // Handle max filesize (e.g. 5MB limit for telegram mini app speed)
            if (file.size > 5 * 1024 * 1024) {
                alert('File is too large. Please select a photo under 5MB.');
                photoInput.value = '';
                return;
            }

            reader.readAsDataURL(file);
        }
    }

    // Handle photo removal
    removePhotoBtn.addEventListener('click', (e) => {
        e.preventDefault();
        photoInput.value = ''; // Clear file input
        currentPhotoBase64 = null;

        // Toggle UI
        photoPreview.classList.add('hidden');
        uploadBtn.style.display = 'flex';

        // Reset preview src
        setTimeout(() => {
            previewImg.src = '';
        }, 300);
    });

    // Handle form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Gather Data for validation
        const formData = new FormData(form);
        const payload = {
            toolName: formData.get('toolName'),
            status: formData.get('toolStatus'),
            footageRange: formData.get('footageRange'),
            photoBase64: currentPhotoBase64,
            timestamp: new Date().toISOString()
        };

        // Basic validation
        if (!payload.toolName || payload.toolName.trim() === '') {
            alert('Please enter the Tool Name.');
            return;
        }
        if (!payload.photoBase64) {
            alert('Please upload a photo of the tool before submitting.');
            return;
        }
        if (!payload.status) {
            alert('Please select a Status.');
            return;
        }
        if (!payload.footageRange) {
            alert('Please select a Footage Range.');
            return;
        }

        // Visual feedback during submission
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = `
            <svg class="spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite;">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
            </svg>
            <span>Submitting...</span>
        `;
        submitBtn.style.opacity = '0.7';
        submitBtn.disabled = true;

        console.log("Prepared Payload:", JSON.stringify({
            ...payload,
            photoBase64: 'base64_string_truncated_for_logs...'
        }));

        try {
            // Setup Webhook URL integration (e.g., n8n or Google App Script)
            // Replace with actual URL later
            const WEBHOOK_URL = 'https://joseph-unkidnapped-derangedly.ngrok-free.dev/webhook/23afad17-e1f2-4127-a277-3cd01f409b8f';

            if (WEBHOOK_URL) {
                const submitData = new FormData(form);
                submitData.append('timestamp', payload.timestamp);

                const response = await fetch(WEBHOOK_URL, {
                    method: 'POST',
                    body: submitData
                });
                if (!response.ok) throw new Error('Network response was not ok');
            } else {
                // Simulate network request duration
                await new Promise(resolve => setTimeout(resolve, 800));
            }

            // Success state
            form.reset();
            // Reset custom photo UI
            removePhotoBtn.click();

            successMessage.classList.remove('hidden');

            // Hide success message after 4 seconds
            setTimeout(() => {
                successMessage.classList.add('hidden');
            }, 4000);

            // Optional: Telegram integration feedback
            if (window.Telegram && window.Telegram.WebApp) {
                try {
                    window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
                } catch (e) { }
            }

        } catch (error) {
            console.error('Submission failed:', error);
            alert('Failed to submit data. Please check your connection and try again.');

            if (window.Telegram && window.Telegram.WebApp) {
                try {
                    window.Telegram.WebApp.HapticFeedback.notificationOccurred('error');
                } catch (e) { }
            }
        } finally {
            // Restore button state
            submitBtn.innerHTML = originalBtnText;
            submitBtn.style.opacity = '1';
            submitBtn.disabled = false;
        }
    });
});
