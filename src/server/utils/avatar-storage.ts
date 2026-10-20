import fs from "fs";
import path from "path";

const AVATAR_DIR = path.join(process.cwd(), "public/uploads/avatars");
const PUBLIC_PREFIX = "/uploads/avatars";

export async function saveAvatar(ownerId: string, dataUrl: string): Promise<string> {
  const base64Data = dataUrl.split(",")[1];
  const fileName = `avatar-${ownerId}-${Date.now()}.jpg`;

  await fs.promises.mkdir(AVATAR_DIR, { recursive: true });
  await fs.promises.writeFile(path.join(AVATAR_DIR, fileName), Buffer.from(base64Data, "base64"));

  return `${PUBLIC_PREFIX}/${fileName}`;
}

export function isDataUrlImage(value: string | null | undefined): value is string {
  return !!value && value.startsWith("data:image");
}
