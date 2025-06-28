export interface Customer {
  id?: string
  name: string
  email: string
  phone?: string
  address: string
}

export interface Order {
  id?: string
  customer: Customer
  items: Array<{
    productId: string
    name: string
    price: number
    quantity: number
  }>
  subtotal: number
  tax: number
  total: number
  status: "pending" | "confirmed" | "preparing" | "ready" | "delivered"
  orderDate: string
  notes?: string
}
