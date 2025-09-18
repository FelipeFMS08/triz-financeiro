"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";
const formSchema = z.object({
  email: z.email("Email inválido"),
  password: z
    .string("Senha é obrigatória")
    .min(8, "Senha deve ter pelo menos 8 caracteres"),
});

type FormValues = z.infer<typeof formSchema>;


export default function LoginPage() {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const router = useRouter();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

async function onSubmit(values: FormValues) {
  setIsLoading(true);

  await toast.promise(
    authClient.signIn.email({
      email: values.email,
      password: values.password,
    }),
    {
      loading: "Entrando...",
      success: () => {
        router.push("/");
        return "Login realizado com sucesso!";
      },
      error: (error: { error: { message: string; }; }) => {
        const message = error?.error?.message || "Erro ao fazer login";

        form.setError("email", {
          type: "manual",
          message,
        });
        form.setError("password", {
          type: "manual",
          message,
        });

        return message;
      },
    }
  );

  setIsLoading(false);
}

  return (
    <main className="mx-auto min-h-screen"> 
    <div className="flex flex-col px-4 sm:px-6 lg:px-8 max-w-lg gap-4 mt-20">
      <Image src="/logo-triz.svg" width={350} height={100} alt="" quality={100}/>
      <h1 className="font-extrabold text-4xl">Bem Vinda</h1>
          <p className="font-normal text-lg mb-5">Faça login para continuar.</p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 mt-5">
            <div className="grid gap-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        className="w-full py-6 ring-0 focus-visible:ring-offset-0 focus-visible:ring-0 focus-visible:border-[#A8E6CF]"
                        placeholder="Email."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Senha."
                        className="w-full py-6 focus-visible:ring-offset-0 focus-visible:ring-0 focus-visible:border-[#A8E6CF]"
                        {...field}
                        type="password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex flex-col gap-2 mt-10">
              <Button type="submit" className="w-full py-6 bg-[#A8E6CF] font-bold text-zinc-900 text-lg">
                {isLoading ? (<LoaderCircle className="size-6 animate-spin"/>) : "Entrar"}
              </Button>          
            </div>
          </form>
        </Form>
    </div>
    </main>
  );
};