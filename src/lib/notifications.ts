import { prisma } from "@/lib/prisma";

type NotificationType =
  | "vehicle_expired"
  | "vehicle_warning"
  | "slot_available"
  | "renewal_confirmed"
  | "boost_activated"
  | "cycle_exhausted";

export async function createNotification({
  userId,
  type,
  title,
  body,
  vehicleId,
  actionUrl,
}: {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  vehicleId?: string;
  actionUrl?: string;
}) {
  try {
    await (prisma as any).notification.create({
      data: { userId, type, title, body, vehicleId: vehicleId ?? null, actionUrl: actionUrl ?? null },
    });
  } catch (e) {
    console.error("[notification] create error", e);
  }
}
