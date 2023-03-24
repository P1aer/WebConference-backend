import {string, z} from "zod";

export const registerValidation = z.object({
    body: z.object({
        name: string()
            .nonempty('Name is required')
            .max(32, 'Name must be less than 32 characters'),
        login: string()
            .nonempty('Login is required')
            .max(32, 'Login must be less than 32 characters'),
        password: string()
            .nonempty('Password is required')
            .min(8, 'Password must be more than 8 characters')
            .max(32, 'Password must be less than 32 characters'),
        passwordConfirm: string().nonempty('Please confirm your password'),
    }).refine((data) => data.password === data.passwordConfirm, {
        path: ['passwordConfirm'],
        message: 'Passwords do not match',
    }),
});