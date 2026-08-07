import { UsersThree } from "@phosphor-icons/react";
import { GlassCard } from "../GlassCard";
import type { Student } from "../../lib/theme";

export function StudentsTable({ students, username }: { students: Student[]; username: string }) {
  if (students.length === 0) {
    return (
      <GlassCard className="flex flex-col items-center gap-3 py-14 text-center">
        <UsersThree weight="duotone" className="h-10 w-10 text-ink-faint" />
        <h3 className="text-lg text-ink">ما رفعت طلابك بعد</h3>
        <p className="max-w-sm text-sm text-ink-muted">
          ارفع ملف إكسل أو وورد فيه أسماء طلابك من صفحة التسجيل، وتظهر حساباتهم هنا مباشرة.
        </p>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full text-right">
          <thead>
            <tr className="border-b border-white/10 text-xs text-ink-faint">
              <th className="px-5 py-3 font-semibold">الطالب</th>
              <th className="px-5 py-3 font-semibold">معرف الدخول</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, i) => (
              <tr key={student.id} className="border-b border-white/5 text-sm text-ink last:border-none">
                <td className="px-5 py-3">{student.name}</td>
                <td className="px-5 py-3 text-ink-muted">{`${username}-${i + 1}`}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}
