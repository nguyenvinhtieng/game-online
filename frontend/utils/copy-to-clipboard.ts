export default function copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
        console.log('Text copied to clipboard');
    }
    ).catch((err) => {
        console.error('Error copying text: ', err);
    });
}