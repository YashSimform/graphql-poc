import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { LoginInput } from './login.input';

describe('LoginInput validation', () => {
  function build(overrides: Partial<LoginInput> = {}): LoginInput {
    return plainToInstance(LoginInput, {
      email: 'user@example.com',
      password: 'securePassword123',
      ...overrides,
    });
  }

  it('should pass with valid input', async () => {
    const errors = await validate(build());
    expect(errors).toHaveLength(0);
  });

  it('should fail when email is invalid', async () => {
    const errors = await validate(build({ email: 'not-an-email' }));
    expect(errors.length).toBeGreaterThan(0);
    const emailError = errors.find((e) => e.property === 'email');
    expect(emailError).toBeDefined();
    expect(Object.values(emailError!.constraints ?? {})).toContain(
      'Must be a valid email address',
    );
  });

  it('should fail when email is empty', async () => {
    const errors = await validate(build({ email: '' }));
    expect(errors.length).toBeGreaterThan(0);
    const emailError = errors.find((e) => e.property === 'email');
    expect(emailError).toBeDefined();
  });

  it('should fail when password is shorter than 8 characters', async () => {
    const errors = await validate(build({ password: 'short' }));
    expect(errors.length).toBeGreaterThan(0);
    const passwordError = errors.find((e) => e.property === 'password');
    expect(passwordError).toBeDefined();
    expect(Object.values(passwordError!.constraints ?? {})).toContain(
      'Password must be at least 8 characters',
    );
  });

  it('should pass when password is exactly 8 characters', async () => {
    const errors = await validate(build({ password: 'exactly8' }));
    expect(errors).toHaveLength(0);
  });

  it('should fail when password is empty', async () => {
    const errors = await validate(build({ password: '' }));
    expect(errors.length).toBeGreaterThan(0);
    const passwordError = errors.find((e) => e.property === 'password');
    expect(passwordError).toBeDefined();
  });
});
