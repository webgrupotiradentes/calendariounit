import { useState } from 'react';
import { FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { CalendarEvent, Category } from '@/types/calendar';
import { cn } from '@/lib/utils';

interface PdfCalendarGeneratorProps {
  events: CalendarEvent[];
  categories: Category[];
}

function hslToRgb(hslStr: string): [number, number, number] {
  const parts = hslStr.trim().split(/[\s,/]+/).map(Number);
  const h = (parts[0] || 0) / 360;
  const s = (parts[1] || 0) / 100;
  const l = (parts[2] || 0) / 100;
  if (s === 0) { const v = Math.round(l * 255); return [v, v, v]; }
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1; if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [
    Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    Math.round(hue2rgb(p, q, h) * 255),
    Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  ];
}

const MONTH_NAMES_PT = [
  'JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO',
  'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'
];
const MONTH_NAMES_CAP = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];
const DAY_HEADERS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

// Dark navy blue - matches reference image
const NAVY: [number, number, number] = [13, 38, 73];

export function PdfCalendarGenerator({ events, categories }: PdfCalendarGeneratorProps) {
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const currentYear = new Date().getFullYear();

  const toggleCategory = (id: string) => {
    setSelectedCategoryIds(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const generatePdf = async () => {
    if (events.length === 0) {
      toast.error('Não há eventos para gerar o PDF.');
      return;
    }

    setIsGenerating(true);
    toast.loading('Gerando PDF...', { id: 'pdf-toast' });

    try {
      const { jsPDF } = await import('jspdf');

      // A3 portrait: 297 × 420 mm
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a3' });
      const pageW = 297;
      const pageH = 420;
      const margin = 10;

      // Filter events
      let filteredEvents = events;
      if (selectedCategoryIds.length > 0) {
        filteredEvents = filteredEvents.filter(e => selectedCategoryIds.includes(e.categoryId));
      }

      const activeCategories = selectedCategoryIds.length > 0
        ? categories.filter(c => selectedCategoryIds.includes(c.id))
        : categories.filter(c => filteredEvents.some(e => e.categoryId === c.id));

      // ─── White background ───
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, pageW, pageH, 'F');

      // ─── Title ───
      const titleH = 16;
      doc.setFillColor(...NAVY);
      doc.rect(0, 0, pageW, titleH, 'F');

      let title = `CALENDÁRIO DE PROCESSOS SELETIVOS ${currentYear}`;
      if (selectedCategoryIds.length === 1) {
        const cat = categories.find(c => c.id === selectedCategoryIds[0]);
        if (cat) title = `CALENDÁRIO ${cat.name.toUpperCase()} ${currentYear}`;
      } else if (selectedCategoryIds.length > 1) {
        title = `CALENDÁRIO ${currentYear} — CATEGORIAS SELECIONADAS`;
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(255, 255, 255);
      doc.text(title, margin, 10.5);

      // ─── Calendar grid: 4 cols × 3 rows ───
      const cols = 4;
      const rows = 3;
      const gapX = 3.5;
      const gapY = 3.5;
      const calTop = titleH + 4;

      // Reserve ~42% of the page for the bottom events panel
      const panelH = Math.min(175, pageH * 0.42);
      const calAreaH = pageH - calTop - panelH - 6;
      const cellW = (pageW - margin * 2 - gapX * (cols - 1)) / cols;
      const cellH = (calAreaH - gapY * (rows - 1)) / rows;

      for (let monthIdx = 0; monthIdx < 12; monthIdx++) {
        const col = monthIdx % cols;
        const row = Math.floor(monthIdx / cols);
        const x = margin + col * (cellW + gapX);
        const y = calTop + row * (cellH + gapY);

        // Month cell: light border + white bg
        doc.setFillColor(250, 251, 253);
        doc.setDrawColor(210, 215, 225);
        doc.setLineWidth(0.2);
        doc.roundedRect(x, y, cellW, cellH, 1.2, 1.2, 'FD');

        // Month name header (navy strip)
        doc.setFillColor(...NAVY);
        doc.roundedRect(x, y, cellW, 6.5, 1.2, 1.2, 'F');
        // Fix bottom corners
        doc.rect(x, y + 3.5, cellW, 3, 'F');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6.5);
        doc.setTextColor(255, 255, 255);
        doc.text(MONTH_NAMES_PT[monthIdx], x + cellW / 2, y + 4.4, { align: 'center' });

        // Day column headers
        const dayW = (cellW - 4) / 7;
        const dayHeaderY = y + 10;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(4.2);
        doc.setTextColor(100, 110, 130);
        for (let d = 0; d < 7; d++) {
          doc.text(DAY_HEADERS[d], x + 2 + d * dayW + dayW / 2, dayHeaderY, { align: 'center' });
        }

        // Separator line
        doc.setDrawColor(215, 220, 230);
        doc.setLineWidth(0.15);
        doc.line(x + 1.5, dayHeaderY + 1.2, x + cellW - 1.5, dayHeaderY + 1.2);

        // Day cells
        const firstDay = new Date(currentYear, monthIdx, 1);
        const startDow = firstDay.getDay();
        const daysInMonth = new Date(currentYear, monthIdx + 1, 0).getDate();
        const dayCellH = (cellH - 15.5) / 6;
        const dayCellY = dayHeaderY + 2.5;

        for (let day = 1; day <= daysInMonth; day++) {
          const dow = (startDow + day - 1) % 7;
          const week = Math.floor((startDow + day - 1) / 7);
          const dx = x + 2 + dow * dayW;
          const dy = dayCellY + week * dayCellH;
          const sz = Math.min(dayW - 0.5, dayCellH - 0.3);

          const dateStr = `${currentYear}-${String(monthIdx + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const dayEvts = filteredEvents.filter(e => dateStr >= e.date && dateStr <= (e.endDate || e.date));

          if (dayEvts.length > 0) {
            // Use first event's category for the badge
            const cat = categories.find(c => c.id === dayEvts[0].categoryId);
            if (cat) {
              const [r, g, b] = hslToRgb(cat.color);
              doc.setFillColor(r, g, b);
              doc.roundedRect(dx + (dayW - sz) / 2, dy - sz * 0.8, sz, sz, 1.1, 1.1, 'F');
              doc.setFont('helvetica', 'bold');
              doc.setFontSize(4.5);
              doc.setTextColor(255, 255, 255);
              doc.text(String(day), dx + dayW / 2, dy - 0.15, { align: 'center' });
            }
          } else {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(4.5);
            // Sundays in light red
            doc.setTextColor(dow === 0 ? 200 : 50, dow === 0 ? 60 : 55, dow === 0 ? 60 : 65);
            doc.text(String(day), dx + dayW / 2, dy, { align: 'center' });
          }
        }
      }

      // ─── Dark navy panel at bottom ───
      const panelY = pageH - panelH;
      doc.setFillColor(...NAVY);
      doc.rect(0, panelY, pageW, panelH, 'F');

      // ─── Events list in 2 columns ───
      const eventsByMonth: Record<number, typeof filteredEvents> = {};
      filteredEvents.forEach(evt => {
        const m = Number(evt.date.slice(5, 7)) - 1;
        if (!eventsByMonth[m]) eventsByMonth[m] = [];
        if (!eventsByMonth[m].find(e => e.id === evt.id)) eventsByMonth[m].push(evt);
      });

      const sortedMonths = Object.keys(eventsByMonth).map(Number).sort((a, b) => a - b);

      if (sortedMonths.length > 0) {
        const half = Math.ceil(sortedMonths.length / 2);
        const leftMonths = sortedMonths.slice(0, half);
        const rightMonths = sortedMonths.slice(half);

        const colW = (pageW - margin * 2 - 8) / 2;
        const badgeSz = 5.8;
        const rowH = 4.5;

        const drawColumn = (months: number[], startX: number) => {
          let yPos = panelY + 8;
          const maxY = pageH - 5;

          months.forEach(month => {
            const monthEvts = eventsByMonth[month].sort((a, b) => a.date.localeCompare(b.date));
            if (yPos + 7 > maxY) return;

            // Month heading — bold golden yellow with underline
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(7.5);
            doc.setTextColor(255, 213, 80);
            doc.text(MONTH_NAMES_CAP[month], startX, yPos);
            const tw = doc.getTextWidth(MONTH_NAMES_CAP[month]);
            doc.setDrawColor(255, 213, 80);
            doc.setLineWidth(0.35);
            doc.line(startX, yPos + 1, startX + tw, yPos + 1);
            yPos += 5.5;

            monthEvts.forEach(evt => {
              if (yPos + rowH > maxY) return;
              const cat = categories.find(c => c.id === evt.categoryId);
              const dayNum = evt.date.split('-')[2];

              // Badge
              if (cat) {
                const [r, g, b] = hslToRgb(cat.color);
                doc.setFillColor(r, g, b);
                doc.roundedRect(startX, yPos - badgeSz * 0.78, badgeSz, badgeSz, 0.9, 0.9, 'F');
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(5);
                doc.setTextColor(255, 255, 255);
                doc.text(dayNum, startX + badgeSz / 2, yPos - 0.5, { align: 'center' });
              }

              // Event title
              const hasLink = !!evt.link;
              doc.setFont('helvetica', hasLink ? 'bolditalic' : 'normal');
              doc.setFontSize(5.2);
              doc.setTextColor(hasLink ? 130 : 220, hasLink ? 210 : 225, hasLink ? 255 : 240);
              const maxTitleW = colW - badgeSz - 4;
              const lines = doc.splitTextToSize(evt.title || 'Evento', maxTitleW);
              doc.text(lines[0], startX + badgeSz + 2.5, yPos - 0.5);
              yPos += rowH;
            });

            yPos += 2.5;
          });
        };

        drawColumn(leftMonths, margin);
        drawColumn(rightMonths, margin + colW + 8);
      }

      // ─── Category legend (just above the panel) ───
      if (activeCategories.length > 0) {
        const legY = panelY - 4.5;
        let legX = margin;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(5.5);
        doc.setTextColor(40, 50, 70);
        doc.text('LEGENDA:', legX, legY);
        legX += 20;

        activeCategories.forEach(cat => {
          const [r, g, b] = hslToRgb(cat.color);
          doc.setFillColor(r, g, b);
          doc.roundedRect(legX, legY - 3.5, 3.5, 3.5, 0.6, 0.6, 'F');
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(5.5);
          doc.setTextColor(40, 50, 70);
          doc.text(cat.name, legX + 5, legY);
          legX += doc.getTextWidth(cat.name) + 12;
        });
      }

      // ─── Footer inside dark panel ───
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(4.5);
      doc.setTextColor(120, 150, 190);
      doc.text('Universidade Tiradentes · Calendário Acadêmico', pageW - margin, pageH - 4, { align: 'right' });

      // ─── Save ───
      const suffix = selectedCategoryIds.length > 0
        ? `-${activeCategories.map(c => c.name.toLowerCase().replace(/\s/g, '-')).join('-')}`
        : '';
      doc.save(`calendario-${currentYear}${suffix}.pdf`);
      toast.success('PDF gerado com sucesso!', { id: 'pdf-toast' });
      setIsOpen(false);

    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Erro ao gerar PDF. Verifique o console.', { id: 'pdf-toast' });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 text-xs rounded-lg gap-1.5">
          <FileDown className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Gerar PDF</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base font-bold">Gerar Calendário em PDF</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
              Filtrar por Categoria
            </label>
            <div className="space-y-1.5 max-h-52 overflow-y-auto pr-0.5">
              {/* All categories option */}
              <button
                onClick={() => setSelectedCategoryIds([])}
                className={cn(
                  'flex items-center gap-2.5 w-full p-2.5 rounded-xl text-sm transition-all',
                  selectedCategoryIds.length === 0
                    ? 'bg-primary/10 border border-primary/30 text-primary font-semibold'
                    : 'bg-muted/50 hover:bg-muted text-foreground'
                )}
              >
                <div className="w-3 h-3 rounded-full bg-gradient-to-br from-primary to-accent flex-shrink-0" />
                <span>Todas as categorias</span>
                {selectedCategoryIds.length === 0 && (
                  <span className="ml-auto text-[10px] font-bold text-primary">✓</span>
                )}
              </button>

              {categories.map((category) => {
                const isSelected = selectedCategoryIds.includes(category.id);
                return (
                  <button
                    key={category.id}
                    onClick={() => toggleCategory(category.id)}
                    className={cn(
                      'flex items-center gap-2.5 w-full p-2.5 rounded-xl text-sm transition-all',
                      isSelected
                        ? 'border font-semibold bg-opacity-10'
                        : 'bg-muted/50 hover:bg-muted text-foreground'
                    )}
                    style={isSelected ? {
                      backgroundColor: `hsl(${category.color} / 0.1)`,
                      borderColor: `hsl(${category.color} / 0.4)`,
                      color: `hsl(${category.color})`,
                    } : undefined}
                  >
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0 transition-transform"
                      style={{ backgroundColor: `hsl(${category.color})`, transform: isSelected ? 'scale(1.2)' : 'scale(1)' }}
                    />
                    <span>{category.name}</span>
                    {isSelected && (
                      <span className="ml-auto text-[10px] font-bold" style={{ color: `hsl(${category.color})` }}>✓</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/40 border border-border/40">
            <FileDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Formato A3 retrato com 12 meses e painel de eventos no estilo institucional.
            </p>
          </div>

          <Button
            onClick={generatePdf}
            disabled={isGenerating}
            className="w-full rounded-xl h-11 font-semibold"
          >
            {isGenerating ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                Gerando...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <FileDown className="w-4 h-4" />
                Baixar PDF
              </span>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
