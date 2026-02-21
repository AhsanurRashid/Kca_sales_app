"use client"

import * as React from "react"
import Image from "next/image"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

import { IActionResponse, loginFormSchema } from "@/lib/schema"
import { loginAction } from "@/app/actions/login-action"
import { cn } from "@/lib/utils"
import { useUserStore } from "@/store/user-store"
import { useRouter } from "next/navigation"

const LoginForm = () => {
  const router = useRouter()
  const { setUser } = useUserStore()
  const form = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const { isSubmitting } = form.formState

  async function onSubmit(data: z.infer<typeof loginFormSchema>) {
    const formData = new FormData()
    formData.append("email", data.email)
    formData.append("password", data.password)

    const result: IActionResponse = await loginAction(formData)

    if (result.success) {
      form.reset()
      setUser(result.user || null)
      router.push("/app")
    }

    toast(
      <h1 className={cn("flex items-center gap-2 text-sm", result.success ? "text-success" : "text-destructive")}>
        {result.success ? <CheckCircle className="size-4" /> : <XCircle className="size-4" />}
        {result.success ? "Login successful!" : "Login failed!"}
      </h1>, 
      {
        description: (
          <p className={cn(result.success ? "text-sm text-success" : "text-sm text-destructive")}>{result.message}</p>
        ),
        position: "bottom-right",
        classNames: {
          content: "flex flex-col gap-2",
        },
        style: {
          "--border-radius": "calc(var(--radius)  + 4px)",
          "--background": "var(--chart-2)",
        } as React.CSSProperties,
      }
    )
  }

  return (
    <div className="w-full max-w-sm">
      {/* Logo */}
      <div className="flex justify-center mb-8">
        <div className="size-20 rounded-3xl bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center shadow-2xl">
          <Image src="/assets/images/logo.webp" alt="Logo" width={48} height={48} />
        </div>
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-lg">Welcome Back</h1>
        <p className="text-white/70 mt-2">Sign in to your account</p>
      </div>

      {/* Glass Card */}
      <div className="bg-white/10 dark:bg-white/5 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FieldGroup>
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Input
                    {...field}
                    id="login-email"
                    type="email"
                    aria-invalid={fieldState.invalid}
                    placeholder="Email address"
                    disabled={isSubmitting}
                    className="h-14 rounded-2xl bg-white/10 dark:bg-white/5 border border-white/20 text-white placeholder:text-white/50 focus:bg-white/20 focus:border-white/40 focus:ring-0 transition-all"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>

          <FieldGroup>
            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <Input
                    {...field}
                    id="login-password"
                    type="password"
                    aria-invalid={fieldState.invalid}
                    placeholder="Password"
                    disabled={isSubmitting}
                    className="h-14 rounded-2xl bg-white/10 dark:bg-white/5 border border-white/20 text-white placeholder:text-white/50 focus:bg-white/20 focus:border-white/40 focus:ring-0 transition-all"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-14 rounded-2xl font-semibold text-base bg-white text-[#5C91E7] hover:bg-white/90 shadow-xl hover:shadow-2xl transition-all"
          >
            {isSubmitting ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              "Sign In"
            )}
          </Button>
        </form>
      </div>

      {/* Links */}
      <div className="mt-8 text-center space-y-4">
        <a
          href="#"
          className="text-sm text-white/80 hover:text-white transition-colors hover:underline underline-offset-4"
        >
          Forgot your password?
        </a>
        <div className="text-sm text-white/60">
          Need an account?{" "}
          <a
            href="#"
            className="text-white/90 hover:text-white transition-colors hover:underline underline-offset-4"
          >
            Contact admin
          </a>
        </div>
      </div>
    </div>
  )
}
export default LoginForm