/** Requires local-part + @ + domain + dot + TLD (≥2 chars). */
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/** Requires at least one digit and at least one special (non-alphanumeric) character. */
export const PASSWORD_STRENGTH_REGEX = /^(?=.*[0-9])(?=.*[^a-zA-Z0-9]).*$/;
