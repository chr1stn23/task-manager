import { FormGroup } from '@angular/forms';

export function getFieldError(
  form: FormGroup,
  field: string,
  submitted: boolean,
  labels: Record<string, string>,
): string | null {
  const control = form.get(field);

  if (!control || !control.errors) return null;

  if (!control.touched && !submitted) return null;

  const errors = control.errors;
  const label = labels[field] ?? 'Este campo';

  if (errors['required']) return `${label} es requerido`;

  if (errors['email']) return `${label} no es válido`;

  if (errors['minlength']) {
    return `${label} debe tener al menos ${errors['minlength'].requiredLength} caracteres`;
  }

  if (errors['maxlength']) {
    return `${label} debe tener máximo ${errors['maxlength'].requiredLength} caracteres`;
  }

  if (errors['pattern']) {
    return `${label} debe tener mayúscula, minúscula, número y carácter especial (@#$%^&+=!) `;
  }

  return null;
}
