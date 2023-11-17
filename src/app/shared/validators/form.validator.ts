

/* validatte form fields */
export const validateField = (form) => {
    Object.keys(form.controls).forEach(field => {
        const controls = form.get(field);
        controls.markAsTouched({ onlySelf: true });
    })
}