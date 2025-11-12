import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

// Create database client with automatic schema creation
const client = createClient({
  url: process.env.DATABASE_URL || "file:./atavi.db",
});

// Create and export database instance with automatic schema updates
export const db = drizzle(client, {
  schema,
  logger: process.env.NODE_ENV === 'development'
});

// Export schema for easy access
export * from "./schema";

// Helper function to initialize database with default data
export async function initializeDatabase() {
  try {
    console.log("Initializing database...");

    // Check if we need to create default menu items
    const existingItems = await db.query.menuItems.findMany();

    if (existingItems.length === 0) {
      console.log("Creating default menu items...");
      const defaultMenuItems = [
        // Pratos principais
        { id: '1', name: 'Hambúrguer Tradicional', price: 25.00, category: 'food', description: 'Pão, carne, queijo, alface, tomate', preparationTime: 15, isAvailable: true },
        { id: '2', name: 'Hambúrguer Bacon', price: 32.00, category: 'food', description: 'Pão, carne, queijo, bacon, alface, tomate', preparationTime: 18, isAvailable: true },
        { id: '3', name: 'Hambúrguer Vegano', price: 28.00, category: 'food', description: 'Pão, hambúrguer vegetal, queijo vegano, alface', preparationTime: 15, isAvailable: true },
        { id: '4', name: 'Batata Frita', price: 12.00, category: 'food', description: 'Porção de batata frita crocante', preparationTime: 10, isAvailable: true },
        { id: '5', name: 'Onion Rings', price: 15.00, category: 'food', description: 'Anéis de cebola empanados', preparationTime: 12, isAvailable: true },

        // Bebidas
        { id: '6', name: 'Refrigerante Lata', price: 6.00, category: 'drink', description: 'Coca-Cola, Guaraná, Fanta', preparationTime: 2, isAvailable: true },
        { id: '7', name: 'Suco Natural', price: 8.00, category: 'drink', description: 'Laranja, Limão, Maracujá', preparationTime: 5, isAvailable: true },
        { id: '8', name: 'Água Mineral', price: 4.00, category: 'drink', description: 'Com ou sem gás', preparationTime: 1, isAvailable: true },
        { id: '9', name: 'Cerveja', price: 10.00, category: 'drink', description: 'Long neck 350ml', preparationTime: 2, isAvailable: true },

        // Sobremesas
        { id: '10', name: 'Brownie', price: 12.00, category: 'dessert', description: 'Brownie com sorvete', preparationTime: 8, isAvailable: true },
        { id: '11', name: 'Milk Shake', price: 15.00, category: 'dessert', description: 'Chocolate, Morango ou Ovomaltine', preparationTime: 6, isAvailable: true },
        { id: '12', name: 'Petit Gateau', price: 18.00, category: 'dessert', description: 'Bolho de chocolate quente', preparationTime: 10, isAvailable: true },
      ];

      await db.insert(schema.menuItems).values(defaultMenuItems);
      console.log("Default menu items created successfully");
    }

    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Failed to initialize database:", error);
    throw error;
  }
}

// Note: Database is initialized lazily when first accessed
// This prevents initialization issues in serverless environments