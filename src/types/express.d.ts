import "express";

declare module "express-serve-static-core" {
  interface Request {
    user?: {
      id: number;
      rol: string; // <-- aquí cambiamos de rol_id:number a rol:string
    };
  }
}
