/**
 * Notification System for CRUD Operations
 * Displays real-time feedback to users
 */

class NotificationManager {
    constructor() {
        this.initialized = false;
        this.initWhenReady();
    }

    initWhenReady() {
        if (this.initialized) return;

        // Wait for DOMContentLoaded if still parsing
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initWhenReady(), { once: true });
            return;
        }

        // Ensure body exists before creating container
        if (!document.body) {
            setTimeout(() => this.initWhenReady(), 50);
            return;
        }

        this.init();
        this.initialized = true;
    }

    init() {
        this.createContainer();
        this.addStyles();
    }

    createContainer() {
        if (!document.getElementById('notification-container')) {
            const container = document.createElement('div');
            container.id = 'notification-container';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                max-width: 400px;
                pointer-events: none;
            `;
            document.body.appendChild(container);
        }
    }

    addStyles() {
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideIn {
                    from {
                        transform: translateX(400px);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                @keyframes slideOut {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(400px);
                        opacity: 0;
                    }
                }
                @media (max-width: 768px) {
                    #notification-container {
                        left: 10px !important;
                        right: 10px !important;
                        max-width: calc(100% - 20px) !important;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    show(message, type = 'info', duration = 4000) {
        const notification = document.createElement('div');
        notification.style.pointerEvents = 'auto';
        
        // Inline SVGs with clearer shapes
        const icons = {
            success: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10Z" fill="currentColor" opacity="0.12"/><path d="M9.5 12.8l2 2 3.5-4.6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
            error: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10Z" fill="currentColor" opacity="0.12"/><path d="M9 9l6 6M15 9l-6 6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
            warning: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 3.5 3.8 18c-.36.63.09 1.4.81 1.4h14.78c.72 0 1.17-.77.81-1.4L12 3.5Z" stroke="currentColor" stroke-width="2" fill="currentColor" opacity="0.08"/><path d="M12 9.5V13" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><circle cx="12" cy="16.5" r="1.2" fill="currentColor"/></svg>',
            info: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.12"/><path d="M12 10v6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><circle cx="12" cy="7" r="1.3" fill="currentColor"/></svg>'
        };

        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };

        notification.style.cssText = `
            background: white;
            border-left: 4px solid ${colors[type]};
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            padding: 16px 20px;
            margin-bottom: 12px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            gap: 12px;
            animation: slideIn 0.3s ease-out;
            max-width: 100%;
            word-wrap: break-word;
        `;

        notification.innerHTML = `
            <span style="
                display: inline-flex;
                width: 22px;
                height: 22px;
                color: ${colors[type]};
                flex-shrink: 0;
                align-items: center;
                justify-content: center;
            " aria-hidden="true">${icons[type]}</span>
            <span style="
                flex: 1;
                color: #1f2937;
                font-size: 14px;
                line-height: 1.5;
            ">${message}</span>
            <button onclick="this.parentElement.remove()" style="
                background: none;
                border: none;
                font-size: 20px;
                cursor: pointer;
                color: #9ca3af;
                padding: 0;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
            ">×</button>
        `;

        const container = document.getElementById('notification-container');
        container.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => notification.remove(), 300);
        }, duration);
    }

    success(message, duration) {
        this.show(message, 'success', duration);
    }

    error(message, duration) {
        this.show(message, 'error', duration);
    }

    warning(message, duration) {
        this.show(message, 'warning', duration);
    }

    info(message, duration) {
        this.show(message, 'info', duration);
    }
}

// Create global instance
window.notify = new NotificationManager();
