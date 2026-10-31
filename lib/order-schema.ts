import { z } from "zod";

const cleanText = (value: string) =>
  value.replace(/[\u0000-\u001f\u007f]/g, " ").trim();

export const orderSubmissionSchema = z
  .object({
    kind: z.enum(["order", "question"]),
    name: z.string().trim().min(2).max(100).transform(cleanText),
    email: z.string().trim().email().max(254).toLowerCase(),
    phone: z
      .string()
      .trim()
      .max(30)
      .optional()
      .or(z.literal(""))
      .transform((v) => (v ? cleanText(v) : null)),
    product: z.string().trim().max(100).optional().or(z.literal("")),
    quantity: z.coerce.number().int().min(1).max(20).default(1),
    message: z
      .string()
      .trim()
      .max(2000)
      .optional()
      .or(z.literal(""))
      .transform((v) => (v ? cleanText(v) : null)),
    consent: z.literal(true),
    website: z.string().max(0).optional().or(z.literal("")),
    formStartedAt: z.coerce.number().int().positive(),
    idempotencyKey: z.string().uuid(),
  })
  .superRefine((data, ctx) => {
    if (data.kind === "order") {
      if (!data.product) {
        ctx.addIssue({ code: "custom", path: ["product"], message: "Изберете продукт." });
      }
      if (!data.phone || data.phone.replace(/\D/g, "").length < 6) {
        ctx.addIssue({ code: "custom", path: ["phone"], message: "Въведете валиден телефон." });
      }
    }
    if (data.kind === "question" && (!data.message || data.message.length < 5)) {
      ctx.addIssue({ code: "custom", path: ["message"], message: "Напишете вашия въпрос." });
    }
    const age = Date.now() - data.formStartedAt;
    if (age < 3000 || age > 24 * 60 * 60 * 1000) {
      ctx.addIssue({ code: "custom", path: ["formStartedAt"], message: "Формата е изтекла. Презаредете страницата." });
    }
  });

export type OrderSubmission = z.infer<typeof orderSubmissionSchema>;
