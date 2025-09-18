"use client";

import {
  Utensils,
  CarFront,
  FilmIcon,
  HomeIcon,
  HeartIcon,
  Book,
  BanknoteIcon,
  MenuIcon,
  ShoppingCart,
  ShoppingBag,
  Monitor,
  Calendar,
  Shirt,
  Scissors,
  Gift,
  Stethoscope,
  CalendarClock,
  Code2,
  TrainFront,
  Pizza,
  Coins,
  Zap
} from 'lucide-react';
import { CategorieButton } from "./categorie-button";
import type { Category } from "@/types";
import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface CategorieProps {
  categories: Category[];
}

export function getIcon(categoryId: number): ReactNode {
  switch (categoryId) {
    case 1:
      return <Utensils />;
    case 2:
      return <CarFront />;
    case 3:
      return <FilmIcon />;
    case 4:
      return <HomeIcon />;
    case 5:
      return <HeartIcon />;
    case 6:
      return <Book />;
    case 7:
      return <BanknoteIcon />;
    case 9:
      return <ShoppingCart />; // Mercado
    case 10:
      return <ShoppingBag />; // Necessidades
    case 11:
      return <Monitor />; // Eletronicos
    case 12:
      return <Calendar />; // Assinaturas
    case 13:
      return <Shirt />; // Roupa
    case 14:
      return <Scissors />; // Beleza
    case 15:
      return <Gift />; // Presentes
    case 16:
      return <Stethoscope />; // Saúde
    case 17:
      return <CalendarClock />; // Despesas Eventuais
    case 18:
      return <Code2 />; // Desenvolvimento
    case 19:
      return <TrainFront />; // Uber/Transporte
    case 20:
      return <Pizza />; // IFood/Restaurante
    case 21:
      return <FilmIcon />; // Lazer
    case 22:
      return <HomeIcon />; // Aluguel
    case 23:
      return <Zap />; // Contas
    
    default:
      return <MenuIcon />;
  }
}

export function Categories({ categories }: CategorieProps) {
  return (
    <div className="flex flex-col gap-3">
      <h1 className="font-semibold">Categorias</h1>
      <div>
        <div className="grid grid-cols-4 gap-5">
          {categories.length > 0 ? (
            categories.map((category) => (
              <CategorieButton
                key={category.id}
                name={category.name}
                icon={getIcon(category.id)}
              />
            ))
          ) : (
            <div className="grid grid-cols-4 pb-2">
              <div className="flex flex-col space-y-3">
                <Skeleton className="h-20 w-20 rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            <div className="flex flex-col space-y-3 ml-20">
                <Skeleton className="h-20 w-20 rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
              <div className="flex flex-col space-y-3 ml-40">
                <Skeleton className="h-20 w-20 rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
              <div className="flex flex-col space-y-3 ml-60">
                <Skeleton className="h-20 w-20 rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            </div>       
          )}
        </div>
      </div>
    </div>
  );
}
