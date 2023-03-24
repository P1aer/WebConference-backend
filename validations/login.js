import {string, z} from "zod";

export const loginValidation = z.object({
    body: z.object({
        login: string()
            .nonempty('Login is required')
            .max(32, 'Login must be less than 32 characters'),
        password: string()
            .nonempty('Password is required')
            .min(8, 'Password must be more than 8 characters')
            .max(32, 'Password must be less than 32 characters'),
    })
});