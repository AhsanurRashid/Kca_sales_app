import z from "zod";

export const loginFormSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export interface IUser {
  full_name: string;
  home_page: string;
  message: string;
}

export interface IActionResponse {
  user ?: IUser | null;
  success: boolean;
  message: string;
  errors?: string | string[] | Record<string, string[]>,
}

