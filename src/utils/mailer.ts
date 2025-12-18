// src/utils/mailer.ts
import nodemailer, { type Transporter } from "nodemailer";

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Falta variable de entorno: ${name}`);
  return v;
}

function toBool(value: string | undefined, defaultValue: boolean): boolean {
  if (value === undefined) return defaultValue;
  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}

let cachedTransporter: Transporter | null = null;

export function getMailer(): Transporter {
  if (cachedTransporter) return cachedTransporter;

  const host = requireEnv("SMTP_HOST");
  const port = Number(requireEnv("SMTP_PORT"));
  const secure = toBool(process.env.SMTP_SECURE, port === 465);

  const user = requireEnv("SMTP_USER");
  const pass = requireEnv("SMTP_PASS");

  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });

  return cachedTransporter;
}

export async function verifyMailer(): Promise<void> {
  const mailer = getMailer();
  await mailer.verify();
}

export type AdminNotificacionPayload = {
  tipo: "MODULO_COMPLETADO" | "CURSO_COMPLETADO";
  usuario: {
    id: number;
    email: string;
    nombres?: string | null;
    apellido_paterno?: string | null;
    apellido_materno?: string | null;
  };
  curso?: { id: number; titulo: string };
  modulo?: { id: number; titulo: string };
  fechaISO: string; // new Date().toISOString()
};

function buildNombre(u: AdminNotificacionPayload["usuario"]): string {
  const partes = [
    u.nombres ?? "",
    u.apellido_paterno ?? "",
    u.apellido_materno ?? "",
  ]
    .map((s) => s.trim())
    .filter(Boolean);

  return partes.length ? partes.join(" ") : u.email;
}

export async function notificarAdmin(payload: AdminNotificacionPayload): Promise<void> {
  const mailer = getMailer();

  const to = requireEnv("ADMIN_NOTIFY_EMAIL");
  const from = process.env.MAIL_FROM || `Betania <${requireEnv("SMTP_USER")}>`;

  const nombre = buildNombre(payload.usuario);

  const subject =
    payload.tipo === "MODULO_COMPLETADO"
      ? `✅ Módulo completado: ${payload.modulo?.titulo ?? "Módulo"} — ${nombre}`
      : `🏁 Curso completado: ${payload.curso?.titulo ?? "Curso"} — ${nombre}`;

  const lines: string[] = [];
  lines.push(`Tipo: ${payload.tipo}`);
  lines.push(`Fecha: ${payload.fechaISO}`);
  lines.push(`Usuario: ${nombre}`);
  lines.push(`Email: ${payload.usuario.email}`);
  lines.push(`ID Usuario: ${payload.usuario.id}`);

  if (payload.curso) {
    lines.push(`Curso: ${payload.curso.titulo} (ID: ${payload.curso.id})`);
  }
  if (payload.modulo) {
    lines.push(`Módulo: ${payload.modulo.titulo} (ID: ${payload.modulo.id})`);
  }

  await mailer.sendMail({
    from,
    to,
    subject,
    text: lines.join("\n"),
  });
}
