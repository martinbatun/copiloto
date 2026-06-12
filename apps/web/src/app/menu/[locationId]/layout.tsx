import { CartProvider } from "@/components/menu/CartProvider";

// Envuelve toda la superficie del cliente (menú + pedido + confirmación) con
// el carrito persistido por sucursal. React Query ya es global (root Providers).
export default async function MenuLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locationId: string }>;
}) {
  const { locationId } = await params;
  return <CartProvider locationId={locationId}>{children}</CartProvider>;
}
