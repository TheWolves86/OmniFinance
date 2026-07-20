import { db } from "../index";
import { Settings } from "../schema";
import { eq } from "drizzle-orm"

//function to save settings
export async function saveSettings(
  data: typeof Settings.$inferInsert,
  tx: any = db
) {
  await tx.insert(Settings).values(data);
}

//function to get settings
export async function getSettings(tx: any = db) {
  const result = await tx
    .select()
    .from(Settings);

  return result[0] ?? null;
}

//function to update settings
export async function updateSettings(
  data: Partial<
    typeof Settings.$inferInsert
  >,
  tx: any = db
) {
  await tx
    .update(Settings)
    .set({
      ...data,
      updatedAt: Date.now(),
    })
    .where(eq(Settings.id, 1));
}