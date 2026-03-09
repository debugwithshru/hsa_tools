document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const form = document.getElementById('rigForm');
    const rigSelect = document.getElementById('rigSelect');
    const footageSelect = document.getElementById('footageSelect');
    const submitBtn = document.getElementById('submitBtn');
    const successMessage = document.getElementById('successMessage');

    // Webhook URL
    const WEBHOOK_URL = 'https://joseph-unkidnapped-derangedly.ngrok-free.dev/webhook-test/ac4533e7-73c5-4470-a80e-a138bd3f487a';

    // Handle form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Get Telegram User Info
        let telegramUserId = null;
        if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe.user) {
            telegramUserId = window.Telegram.WebApp.initDataUnsafe.user.id;
        }

        // Gather Data 
        const payload = {
            rig: rigSelect.value,
            footage_range: footageSelect.value,
            telegram_user_id: telegramUserId,
            timestamp: new Date().toISOString()
        };

        // Basic validation
        if (!payload.rig) {
            alert('Please select a Rig.');
            return;
        }
        if (!payload.footage_range) {
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

        console.log("Prepared Payload:", JSON.stringify(payload));

        try {
            if (WEBHOOK_URL) {
                const response = await fetch(WEBHOOK_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (!response.ok) throw new Error('Network response was not ok');
            } else {
                // Simulate network request duration if no webhook
                await new Promise(resolve => setTimeout(resolve, 800));
            }

            // Success state
            form.reset();

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
