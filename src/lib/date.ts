// Utilitários de datas (yyyy-MM-dd) sem problemas de timezone

/**
 * Converte uma string no formato `yyyy-MM-dd` para um Date local (00:00 no fuso do usuário).
 * Evita o shift de um dia que acontece quando se usa `new Date('yyyy-MM-dd')` (parse em UTC).
 */
export function parseYmdToLocalDate(ymd: string): Date {
  const [year, month, day] = ymd.split('-').map(Number);
  return new Date(year, month - 1, day);
}
