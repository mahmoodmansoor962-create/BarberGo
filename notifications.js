// Real-time Notification Engine

class NotificationManager {
    constructor() {
        this.container = document.getElementById('toast-container');
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'toast-container';
            document.body.appendChild(this.container);
        }
    }

    // Play alert sound for urgent/smart reminders
    playAlertSound() {
        // In a real browser context without user interaction, audio may be blocked.
        // We use a short synthesized beep to simulate the notification sound.
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gainNode = ctx.createGain();
            osc.connect(gainNode);
            gainNode.connect(ctx.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
            gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
            osc.start();
            osc.stop(ctx.currentTime + 0.1);
        } catch (e) {
            console.log("Audio not supported or blocked");
        }
    }

    show(title, message, type = 'info', playSound = false) {
        if (playSound) this.playAlertSound();

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        let icon = 'fa-info-circle';
        if (type === 'success') icon = 'fa-check-circle';
        if (type === 'warning') icon = 'fa-exclamation-triangle';
        if (type === 'error') icon = 'fa-times-circle';

        toast.innerHTML = `
            <div class="toast-icon"><i class="fa-solid ${icon}"></i></div>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()"><i class="fa-solid fa-times"></i></button>
        `;

        this.container.appendChild(toast);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (document.body.contains(toast)) {
                toast.style.animation = 'slideOutRight 0.3s forwards';
                setTimeout(() => toast.remove(), 300);
            }
        }, 5000);
    }

    // specific business logic methods
    notifyBookingConfirmed(customerName, time) {
        this.show(
            "تأكيد حجز", 
            `تم حجز موعدك بنجاح يا ${customerName} الساعة ${time}.`, 
            'success',
            true
        );
    }

    notifySmartReminder(customerName) {
        this.show(
            "تذكير بموعدك!",
            `يا ${customerName}، موعد حلاقتك يبدأ بعد 30 دقيقة. لا تتأخر!`,
            'warning',
            true
        );
    }

    notifyFreeSlotBroadcast(time) {
        this.show(
            "موعد متاح جديد!",
            `مرحباً! لقد أصبح الوقت ${time} متاحاً للتو للحجز عند حلاقك المفضل.`,
            'info',
            true
        );
    }
}

window.notifier = new NotificationManager();
