import type { Gender } from "../../lib/theme";

const palette: Record<Gender, { skin: string; body: string }> = {
  boys: { skin: "#ffcf66", body: "#2bab9f" },
  girls: { skin: "#ffcf66", body: "#ea5a8c" },
};

export function FacelessAvatar({ gender, className }: { gender: Gender; className?: string }) {
  const { skin, body } = palette[gender];
  return (
    <svg viewBox="0 0 48 48" className={className} role="img" aria-label="الصورة الرمزية">
      <circle cx="24" cy="24" r="24" fill="#1f1f1f" />
      <circle cx="24" cy="19" r="9" fill={skin} />
      <path d="M8 44c1-8 7-13 16-13s15 5 16 13" fill={body} />
      {gender === "girls" && <path d="M13 17c0-8 5-13 11-13s11 5 11 13c-3-3-7-4-11-4s-8 1-11 4Z" fill="#8a5a2b" />}
    </svg>
  );
}
