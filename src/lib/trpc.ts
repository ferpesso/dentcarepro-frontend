import { createTRPCReact } from "@trpc/react-query";

// Tipo importado do backend
// Em produção, este tipo será sincronizado automaticamente
export const trpc = createTRPCReact<any>();
