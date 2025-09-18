"use client";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup } from "@/components/ui/radio-group";
import { Tabs, TabsList } from "@/components/ui/tabs";
import type { Category } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { RadioGroupItem } from "@radix-ui/react-radio-group";
import { TabsContent, TabsTrigger } from "@radix-ui/react-tabs";
import { CircleCheck, Heading3, LoaderCircle, XIcon } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { getIcon } from "../dashboard/categories/categories";
import type { NewTransactionData } from "@/hooks/use-month-navigator";
import { ScrollArea } from "@/components/ui/scroll-area";

const formSchema = z.object({
  amount: z.string().min(1, "Valor é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
  categoryId: z.string().min(1, "Categoria é obrigatória"),
});

type FormValues = z.infer<typeof formSchema>;

type AddTransactionProps = {
  onAdd: (data: NewTransactionData) => Promise<void>;
  isSubmitting: boolean;
  setIsSubmitting: (isSubmitting: boolean) => void;
  categories: Category[];
};

export function AddButton({
  onAdd,
  isSubmitting,
  setIsSubmitting,
  categories,
}: AddTransactionProps) {
  const [type, setType] = useState<"income" | "expense">("income");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: "",
      description: "",
      categoryId: "",
    },
  });

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true);
    const transactionToAdd: NewTransactionData = {
      ...values,
      categoryId: Number(values.categoryId),
      type,
    };
    await onAdd(transactionToAdd);
    form.reset();
    setIsSubmitting(false);
  }

  return (
    <Drawer>
      <DrawerTrigger className="fixed bottom-25 right-5 text-white w-14 h-14 rounded-full bg-[#A8E6CF] text-3xl">
        +
      </DrawerTrigger>
      <DrawerContent className="h-[98vh] max-h-[98vh] bg-white dark:bg-zinc-800">
        <Tabs defaultValue={type} className="w-full h-full flex flex-col">
          <DrawerHeader className="flex-shrink-0 pb-4">
            <DrawerClose asChild className="absolute left-5">
              <XIcon />
            </DrawerClose>
            <DrawerTitle className="text-xl font-bold mb-5">
              Adicione uma transação
            </DrawerTitle>
            <TabsList className="flex w-full p-x-1 py-5.5 my-1 rounded-lg gap-1 border bg-white dark:bg-zinc-800 dark:border-zinc-600 border-zinc-200">
              <TabsTrigger
                className="flex-1 w-full h-10 rounded-lg px-2 py-1 font-semibold text-[#36e0a2] shadow-none transition-none data-[state=active]:bg-[#A8E6CF]/30 data-[state=active]:shadow-none"
                value="income"
                onClick={() => setType("income")}
              >
                Entrada
              </TabsTrigger>
              <TabsTrigger
                className="flex-1 h-10 rounded-lg  px-2 py-1 font-semibold text-[#ff7770] shadow-none transition-none data-[state=active]:bg-[#FFAAA5]/30 data-[state=active]:shadow-none"
                value="expense"
                onClick={() => setType("expense")}
              >
                Saida
              </TabsTrigger>
            </TabsList>
          </DrawerHeader>

          <ScrollArea className="h-[51vh] w-full px-4">
            <Form {...form}>
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem className="relative">
                      <FormLabel
                        className={`absolute left-2 top-3 font-bold text-4xl ${
                          type === "income"
                            ? "text-[#A8E6CF]"
                            : "text-[#FFAAA5]"
                        }`}
                      >
                        R$
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="relative w-full pt-8 pb-7 pl-16 text-3xl font-normal placeholder:text-3xl focus-visible:outline-2 focus-visible:outline-[#A8E6CF]"
                          placeholder="0.00,00"
                          type="text"
                          onChange={(e) => {
                            const rawValue = e.target.value.replace(/\D/g, "");
                            const numericValue = rawValue
                              ? Number(rawValue) / 100
                              : 0;
                            form.setValue("amount", numericValue.toString());

                            e.target.value = numericValue
                              ? new Intl.NumberFormat("pt-BR", {
                                  currency: "BRL",
                                  style: "currency",
                                  minimumFractionDigits: 2,
                                }).format(numericValue)
                              : "";
                          }}
                          value={
                            form.getValues("amount")
                              ? new Intl.NumberFormat("pt-BR", {
                                  currency: "BRL",
                                  style: "currency",
                                  minimumFractionDigits: 2,
                                }).format(Number(form.getValues("amount")))
                              : ""
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          className="w-full py-6 focus-visible:outline-2 focus-visible:outline-[#A8E6CF]"
                          placeholder="Descrição."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem className="pb-6">
                      <FormLabel className="text-md font-normal mb-5">
                        Selecione uma categoria
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="grid grid-cols-3 gap-5 px-1"
                        >
                          {categories.length > 0 &&
                            categories.map((option) => (
                              <RadioGroupItem
                                key={option.id}
                                value={option.id.toString()}
                                className="relative group ring-[1px] ring-border rounded-lg text-start data-[state=checked]:ring-2 data-[state=checked]:ring-[#FFAAA5] hover:ring-2 hover:ring-gray-300 transition-all"
                              >
                                <CircleCheck className="absolute top-1 right-1 h-5 w-5 text-primary fill-[#FFAAA5] stroke-white group-data-[state=unchecked]:hidden" />
                                <div
                                  className={`${
                                    field.value === option.id.toString()
                                      ? "text-[#FFAAA5]"
                                      : "text-zinc-700 dark:text-zinc-400"
                                  } flex flex-col items-center p-4`}
                                >
                                  <div className="mb-2 text-2xl">
                                    {getIcon(option.id)}
                                  </div>
                                  <p className="font-normal text-xs text-center leading-tight">
                                    {option.name}
                                  </p>
                                </div>
                              </RadioGroupItem>
                            ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Form>
          </ScrollArea>

          <DrawerFooter className="px-2 pb-10 flex items-center justify-center border-t ">
            <Button
              onClick={form.handleSubmit(onSubmit)}
              className={`w-full py-6 ${
                type === "income"
                  ? "bg-[#A8E6CF] hover:bg-[#6ce4b8]"
                  : "bg-[#FFAAA5] hover:bg-[#ff7e77]"
              } font-bold text-zinc-900 text-lg`}
            >
              {isSubmitting ? (
                <LoaderCircle className="size-6 animate-spin" />
              ) : (
                "Adicionar"
              )}
            </Button>
          </DrawerFooter>
        </Tabs>
      </DrawerContent>
    </Drawer>
  );
}
