import { db } from ".";
import { categories } from "./schema";

// Initial categories with sensible thresholds
const initialCategories = [
  {
    name: "Mercado",
    threshold: 800,
  },
  {
    name: "Necessidades",
    threshold: 300,
  },
  {
    name: "Eletronicos",
    threshold: 200,
  },
  {
    name: "Assinaturas",
    threshold: 150,
  },
  {
    name: "Roupa",
    threshold: 250,
  },
  {
    name: "Beleza",
    threshold: 150,
  },
  {
    name: "Presentes",
    threshold: 100,
  },
  {
    name: "Saúde",
    threshold: 300,
  },
  {
    name: "Despesas Eventuais",
    threshold: 200,
  },
  {
    name: "Desenvolvimento",
    threshold: 100,
  },
  {
    name: "Uber/Transporte",
    threshold: 300,
  },
  {
    name: "IFood/Restaurante",
    threshold: 400,
  },
  {
    name: "Lazer",
    threshold: 300,
    color: "#45B7D1",
  },
  {
    name: "Aluguel",
    threshold: 1500,
  },
  {
    name: "Contas",
    threshold: 500,
  }
];

async function seed() {
  try {
    // Clear existing categories first (optional)
    await db.delete(categories);

    // Insert categories for the provided user
    
    for (const category of initialCategories) {
      await db.insert(categories).values({
        ...category,
        createdAt: new Date()
      });
    }

  } catch (error) {
    console.error("Error seeding categories:", error);
  }
}

// Run the seed function
seed().then(() => process.exit(0));
