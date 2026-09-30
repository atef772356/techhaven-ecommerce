import type { Database, OrderLine } from "./database.types";

export type Product = Database["public"]["Tables"]["products"]["Row"];
export type Order = Database["public"]["Tables"]["orders"]["Row"];
export type OrderItem = Database["public"]["Tables"]["order_items"]["Row"];
export type User = Database["public"]["Tables"]["profiles"]["Row"];
export type { OrderLine };
