import type { MessageType } from "~/interfaces/message.interface";

// Function to create a toast notification
export default function showToast(message: string, type: MessageType = 'success') {
    checkToCreateToastWrapper();
    const styles = {
        success: 'color: white;background-color: #28c76f',
        error: 'color: white;background-color: #EA5456',
        warning: 'color: white;background-color: #F8D800',
        info: 'color: black; background-color: white',
    }
    const toast = document.createElement('div');
    toast.textContent = message;

    toast.setAttribute('style', 'border-radius: 0.5rem; padding: 8px 12px; border: 1px solid currentColor;' + styles[type]);
    const toastWrapper = document.getElementById('toast-wrapper');
    if (toastWrapper) {
        toastWrapper.appendChild(toast);
    }

    setTimeout(() => {
        toast.remove();
    }, 3000); // Remove toast after 3 seconds
}

// Function to ensure a toast wrapper exists
function checkToCreateToastWrapper() {
    if (!document.getElementById('toast-wrapper')) {
        const toastWrapper = document.createElement('div');
        toastWrapper.id = 'toast-wrapper';
        toastWrapper.setAttribute('style', 'position: fixed; top: 0; right: 0; margin: 1rem; display: flex; flex-direction: column-reverse; gap: 0.5rem;');
        document.body.appendChild(toastWrapper);
    }
}
