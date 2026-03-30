import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateUserInput } from './create-user.input';

describe('CreateUserInput validation', () => {
  function build(overrides: Partial<CreateUserInput> = {}): CreateUserInput {
    return plainToInstance(CreateUserInput, {
      name: 'Test User',
      email: 'test@example.com',
      password: 'Secure123!',
      ...overrides,
    });
  }

  it('should pass with valid input', async () => {
    const errors = await validate(build());
    expect(errors).toHaveLength(0);
  });

  it('should fail when name is empty', async () => {
    const errors = await validate(build({ name: '' }));
    expect(errors.length).toBeGreaterThan(0);
    const nameError = errors.find((e) => e.property === 'name');
    expect(nameError).toBeDefined();
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

  it('should fail when email has no TLD', async () => {
    const errors = await validate(build({ email: 'user@nodomain' }));
    expect(errors.length).toBeGreaterThan(0);
    const emailError = errors.find((e) => e.property === 'email');
    expect(emailError).toBeDefined();
    expect(Object.values(emailError!.constraints ?? {})).toContain(
      'Email must include a valid domain with a top-level domain (e.g. user@example.com)',
    );
  });

  it('should fail when email is empty', async () => {
    const errors = await validate(build({ email: '' }));
    expect(errors.length).toBeGreaterThan(0);
    const emailError = errors.find((e) => e.property === 'email');
    expect(emailError).toBeDefined();
  });

  it('should fail when password is missing', async () => {
    const instance = plainToInstance(CreateUserInput, {
      name: 'Test User',
      email: 'test@example.com',
    });
    const errors = await validate(instance);
    expect(errors.length).toBeGreaterThan(0);
    const passwordError = errors.find((e) => e.property === 'password');
    expect(passwordError).toBeDefined();
  });

  it('should fail when password is shorter than 8 characters', async () => {
    const errors = await validate(build({ password: 'Sh0rt!' }));
    expect(errors.length).toBeGreaterThan(0);
    const passwordError = errors.find((e) => e.property === 'password');
    expect(passwordError).toBeDefined();
    expect(Object.values(passwordError!.constraints ?? {})).toContain(
      'Password must be at least 8 characters',
    );
  });

  it('should fail when password has no number', async () => {
    const errors = await validate(build({ password: 'NoNumber!' }));
    expect(errors.length).toBeGreaterThan(0);
    const passwordError = errors.find((e) => e.property === 'password');
    expect(passwordError).toBeDefined();
    expect(Object.values(passwordError!.constraints ?? {})).toContain(
      'Password must contain at least 1 number and 1 special character',
    );
  });

  it('should fail when password has no special character', async () => {
    const errors = await validate(build({ password: 'NoSpecial1' }));
    expect(errors.length).toBeGreaterThan(0);
    const passwordError = errors.find((e) => e.property === 'password');
    expect(passwordError).toBeDefined();
    expect(Object.values(passwordError!.constraints ?? {})).toContain(
      'Password must contain at least 1 number and 1 special character',
    );
  });

  it('should pass when password meets all requirements', async () => {
    const errors = await validate(build({ password: 'Valid1@pass' }));
    expect(errors).toHaveLength(0);
  });

  it('should fail when name exceeds 100 characters', async () => {
    const errors = await validate(build({ name: 'a'.repeat(101) }));
    expect(errors.length).toBeGreaterThan(0);
    const nameError = errors.find((e) => e.property === 'name');
    expect(nameError).toBeDefined();
  });
});
