import { db } from "../index";
import { Settings } from "../schema";
import { eq } from "drizzle-orm"

//function to save settings
export async function saveSettings(
  data: typeof Settings.$inferInsert
) {
  await db.insert(Settings).values(data);
}

//function to get settings
export async function getSettings() {
  const result = await db
    .select()
    .from(Settings);

  return result[0] ?? null;
}

//function to update settings
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