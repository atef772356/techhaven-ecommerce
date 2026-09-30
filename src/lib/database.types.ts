export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type OrderLine = {
  productId: number;
  name: string;
  price: number;
  quantity: number;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          role: "USER" | "ADMIN";
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string;
          role?: "USER" | "ADMIN";
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          role?: "USER" | "ADMIN";
          created_at?: string;
        };
        Relationships: [];
      };
      products: {
        Row: {
          id: number;
          name: string;
          description: string;
          price: number;
          image: string;
          category: string;
          stock: number;
          rating: number;
          created_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          description: string;
          price: number;
          image: string;
          category: string;
          stock?: number;
          rating?: number;
          created_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          description?: string;
          price?: number;
          image?: string;
          category?: string;
          stock?: number;
          rating?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      orders: {
        Row: {
          id: number;
          user_id: string | null;
          customer_name: string;
          email: string;
          address: string;
          city: string;
          zip: string;
          total: number;
          status: "pending" | "processing" | "shipped" | "delivered";
          items: OrderLine[];
          created_at: string;
        };
        Insert: {
          id?: number;
          user_id?: string | null;
          customer_name: string;
          email: string;
          address: string;
          city: string;
          zip: string;
          total: number;
          status?: "pending" | "processing" | "shipped" | "delivered";
          items: OrderLine[];
          created_at?: string;
        };
        Update: {
          id?: number;
          user_id?: string | null;
          customer_name?: string;
          email?: string;
          address?: string;
          city?: string;
          zip?: string;
          total?: number;
          status?: "pending" | "processing" | "shipped" | "delivered";
          items?: OrderLine[];
          created_at?: string;
        };
        Relationships: [];
      };
      order_items: {
        Row: {
          id: number;
          order_id: number;
          product_id: number;
          product_name: string;
          unit_price: number;
          quantity: number;
          created_at: string;
        };
        Insert: {
          id?: number;
          order_id: number;
          product_id: number;
          product_name: string;
          unit_price: number;
          quantity: number;
          created_at?: string;
        };
        Update: {
          id?: number;
          order_id?: number;
          product_id?: number;
          product_name?: string;
          unit_price?: number;
          quantity?: number;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
      create_order: {
        Args: {
          p_customer_name: string;
          p_address: string;
          p_city: string;
          p_zip: string;
          p_items: { productId: number; quantity: number }[];
        };
        Returns: Json;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
