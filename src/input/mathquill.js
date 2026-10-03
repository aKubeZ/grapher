export async function updateMath(element) {
    try {
        await MathJax.typesetPromise([element]).catch((err) => {
            console.error('Error rendering new math:', err);
        });
    } catch (error) {
        // because.
    }
}