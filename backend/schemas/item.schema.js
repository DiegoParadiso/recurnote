import { z } from 'zod';

const itemDataSchema = z.union([
  z.string().refine((str) => {
    try {
      const parsed = JSON.parse(str);
      if (parsed.label && parsed.label.length > 255) return false;
      if (parsed.content && typeof parsed.content === 'string' && parsed.content.length > 50000) return false;
      return true;
    } catch {
      return true; 
    }
  }, { message: "item_data string inválido o excede longitud permitida (label max 255, content max 50000)" }),
  z.object({
    label: z.string().max(255).optional(),
    content: z.string().max(50000).optional(),
  }).catchall(z.any())
]);

export const createItemSchema = z.object({
  body: z.object({
    client_id: z.string().optional(),
    date: z.string().optional(),
    x: z.number().optional(),
    y: z.number().optional(),
    rotation: z.number().optional(),
    rotation_enabled: z.boolean().optional(),
    item_data: itemDataSchema.optional(),
  })
});

export const updateItemSchema = z.object({
  body: z.object({
    version: z.union([z.string(), z.number()]).optional(),
    x: z.number().optional(),
    y: z.number().optional(),
    rotation: z.number().optional(),
    rotation_enabled: z.boolean().optional(),
    item_data: itemDataSchema.optional(),
  }).catchall(z.any())
});

export const syncItemsSchema = z.object({
  body: z.object({
    items: z.array(z.object({
      client_id: z.string().optional(),
      date: z.string().optional(),
      x: z.number().optional(),
      y: z.number().optional(),
      rotation: z.number().optional(),
      rotation_enabled: z.boolean().optional(),
      item_data: itemDataSchema.optional(),
    }).catchall(z.any()))
  })
});
