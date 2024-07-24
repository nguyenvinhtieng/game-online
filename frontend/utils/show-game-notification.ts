
const id = "toast-game-notification-wrapper";
export default function showGameNotification(message: string) {
    checkToCreateToastWrapper();
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.setAttribute('style', 'border-radius: 0.5rem; padding: 8px 12px; color: #0396ff; background-color: #fff; font-size: 24px; font-weight: bold');
    toast.setAttribute('class', 'animation-zoom-out');
    const toastWrapper = document.getElementById(id);
    if (toastWrapper) {
        toastWrapper.innerHTML = ""
        toastWrapper.appendChild(toast);
    }

    setTimeout(() => {
        toast.remove();
    }, 3000); // Remove toast after 3 seconds
}

// Function to ensure a toast wrapper exists
function checkToCreateToastWrapper() {
    if (!document.getElementById(id)) {
        const toastWrapper = document.createElement('div');
        toastWrapper.id = id;
        toastWrapper.setAttribute('style', 'position: fixed; top: 50%; right: 50%; transform: translate(50%, -50%); margin: 1rem; display: flex; flex-direction: column-reverse; gap: 0.5rem;');
        document.body.appendChild(toastWrapper);
    }
}
