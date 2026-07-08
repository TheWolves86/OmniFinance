import { db } from "../index";
import { Settings } from "../schema";
import { eq } from "drizzle-orm"

export async function saveSettings(
  data: typeof Settings.$inferInsert
) {
  await db.insert(Settings).values(data);
}

export async function getSettings() {
  const result = await db
    .select()
    .from(Settings);

  return result[0] ?? null;
}

export async function updateSettings(
  data: Partial<
    typeof Settings.$inferInsert
  >
) {
  await db
    .update(Settings)
    .set({
      ...data,
      updatedAt: Date.now(),
    })
    .where(eq(Settings.id, 1));
}