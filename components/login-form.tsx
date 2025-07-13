"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import spinnerWhite from "@/public/spinner-white.svg";
import spinnerBlack from "@/public/spinner-black.svg";
import Image from "next/image";
import { supabase } from "@/lib/supabase/supabase-client";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [formFields, setFormFields] = useState({
    title: "",
    description: "",
    button: "",
    footerText: "",
    footerAction: "",
  });
  const [authError, setAuthError] = useState("");
  const pathname = usePathname();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState<boolean>(false);

  const formSchema = z
    .object({
      ...(pathname === "/auth/register" && {
        fullName: z
          .string()
          .min(2, "Full name must be at least 2 characters.")
          .trim(),
      }),
      email: z
        .string()
        .email({ message: "Please enter a valid email." })
        .trim(),
      password: z
        .string()
        .min(4)
        .regex(/[a-zA-Z]/, { message: "Must contain at least one letter." })
        .regex(/[0-9]/, { message: "Must contain at least one number." })
        .regex(/[^a-zA-Z0-9]/, {
          message: "Must contain at least one special character.",
        })
        .trim(),
      confirmPassword: z.string().trim(),
    })
    .superRefine((val, ctx) => {
      if (
        pathname === "/auth/register" &&
        val.password !== val.confirmPassword
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Password fields do not match.",
          path: ["confirmPassword"],
        });
      }
    });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);

      if (pathname === "/auth/register") {
        const { error } = await supabase.auth.signUp({
          email: values.email,
          password: values.password,
          options: {
            data: {
              display_name: values.fullName,
            },
          },
        });

        if (error) {
          setAuthError(error.message);
          setIsLoading(false);

          setTimeout(() => {
            setAuthError("");
          }, 2000);
          return;
        }

        router.push("/auth/login");
      }

      if (pathname === "/auth/login") {
        const { error } = await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password,
        });

        if (error) {
          setAuthError(error.message);
          setIsLoading(false);
          setTimeout(() => {
            setAuthError("");
          }, 2000);
          return;
        }

        router.push("/dashboard");
      }
      setIsLoading(false);
    } catch (err) {
      console.log(err);
    }
  }

  async function handleGoogleAuth() {
    setIsGoogleLoading(true);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    });

    if (error) {
      setAuthError(error.message);
      setIsLoading(false);
      return;
    }

    setIsGoogleLoading(false);
  }

  // useEffect(() => {
  //   const checkSession = async () => {
  //     const {
  //       data: { session },
  //     } = await supabase.auth.getSession();

  //     if (session) {
  //       // router.push("/dashboard");
  //     }
  //   };

  //   checkSession();
  // }, []);

  useEffect(() => {
    if (!pathname) return;

    if (pathname === "/auth/register") {
      setFormFields({
        title: "Create an account",
        description: "Enter your email below to create your account",
        button: "Register",
        footerText: "Already have an account?",
        footerAction: "Login",
      });
    }

    if (pathname === "/auth/login") {
      setFormFields({
        title: "Login to your account",
        description: "Enter your email below to login to your account",
        button: "Login",
        footerText: "Don't have an account?",
        footerAction: "Register",
      });
    }
  }, [pathname]);

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Form {...form}>
        <Card>
          <CardHeader>
            <CardTitle>{formFields.title}</CardTitle>
            <CardDescription>{formFields.description} </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="flex flex-col gap-6">
                {pathname === "/auth/register" && (
                  <div className="grid gap-3">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex flex-row">
                            <FormLabel>Full Name</FormLabel>
                          </div>

                          <FormControl>
                            <Input
                              id="name"
                              type="text"
                              placeholder="Full Name"
                              {...field}
                              value={field.value as string}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
                <div className="grid gap-3">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            id="email"
                            type="email"
                            placeholder="m@example.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid gap-3">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex flex-row">
                          <FormLabel>Password</FormLabel>
                          {pathname === "/auth/login" && (
                            <a
                              href="#"
                              className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                            >
                              Forgot your password?
                            </a>
                          )}
                        </div>

                        <FormControl>
                          <Input
                            id="password"
                            type="password"
                            placeholder="Password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                {pathname === "/auth/register" && (
                  <div className="grid gap-3">
                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex flex-row">
                            <FormLabel>Confirm Password</FormLabel>
                          </div>

                          <FormControl>
                            <Input
                              id="confirm-password"
                              type="password"
                              placeholder="Confirm Password"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
                {authError && (
                  <p className="text-destructive text-sm">{authError}</p>
                )}
                <div className="flex flex-col gap-3">
                  <Button type="submit" className="w-full">
                    {isLoading ? (
                      <Image src={spinnerWhite} alt="loading-spinner" />
                    ) : (
                      formFields.button
                    )}
                  </Button>
                </div>
              </div>
            </form>
            <div className="pt-3">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGoogleAuth}
              >
                {isGoogleLoading ? (
                  <Image src={spinnerBlack} alt="loading-spinner" />
                ) : (
                  `${formFields.button} with Google`
                )}
              </Button>
            </div>

            <div className="mt-7 text-center text-sm">
              {formFields.footerText}{" "}
              <a
                href={formFields.footerAction.toLowerCase()}
                className="underline underline-offset-4"
              >
                {formFields.footerAction}
              </a>
            </div>
          </CardContent>
        </Card>
      </Form>
    </div>
  );
}
