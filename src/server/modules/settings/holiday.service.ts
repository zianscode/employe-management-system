import { prisma } from "@/server/db/prisma";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { HolidayRow } from "@/shared/types/settings.types";
import { dateKeyToDate, dateToDateKey, formatDate, toDateKey } from "@/shared/utils/date";

const HolidaySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal tidak valid"),
  name: z.string().trim().min(3, "Nama hari libur minimal 3 karakter"),
});

export type HolidayInput = z.infer<typeof HolidaySchema>;

class HolidayService {
  async keysBetween(start: Date, end: Date): Promise<Set<string>> {
    const holidays = await prisma.holiday.findMany({ where: { date: { gte: start, lte: end } }, select: { date: true } });
    return new Set(holidays.map((h) => dateToDateKey(h.date)));
  }

  async list(year: number): Promise<HolidayRow[]> {
    const holidays = await prisma.holiday.findMany({
      where: { date: { gte: new Date(Date.UTC(year, 0, 1)), lte: new Date(Date.UTC(year, 11, 31)) } },
      orderBy: { date: "asc" },
    });
    return holidays.map((h) => ({ id: h.id, dateKey: dateToDateKey(h.date), date: formatDate(h.date), name: h.name }));
  }

  async upcoming(limit: number): Promise<HolidayRow[]> {
    const holidays = await prisma.holiday.findMany({
      where: { date: { gte: dateKeyToDate(toDateKey()) } },
      orderBy: { date: "asc" },
      take: limit,
    });
    return holidays.map((h) => ({ id: h.id, dateKey: dateToDateKey(h.date), date: formatDate(h.date), name: h.name }));
  }

  async create(input: HolidayInput) {
    const data = HolidaySchema.parse(input);
    try {
      return await prisma.holiday.create({ data: { date: dateKeyToDate(data.date), name: data.name } });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        throw new Error("Tanggal tersebut sudah terdaftar sebagai hari libur");
      }
      throw error;
    }
  }

  async remove(id: string) {
    await prisma.holiday.delete({ where: { id } });
  }
}

export const holidayService = new HolidayService();
