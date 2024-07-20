export default function copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
        showToast('Đã copy!', 'success');
    }
    ).catch((err) => {
        console.error('Error copying text: ', err);
    });
}