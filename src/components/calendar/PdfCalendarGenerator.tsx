import { useState } from 'react';
import { FileDown, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarEvent, Category } from '@/types/calendar';
import { useMacros } from '@/hooks/useMacros';
import { useMicros } from '@/hooks/useMicros';
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

export function PdfCalendarGenerator({ events, categories }: PdfCalendarGeneratorProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedMacroId, setSelectedMacroId] = useState<string>('');
  const [selectedMicroId, setSelectedMicroId] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const { macros } = useMacros();
  const { micros } = useMicros();

  const currentYear = new Date().getFullYear();

  const generatePdf = async () => {
    if (events.length === 0) {
      toast.error('Não há eventos para gerar o PDF.');
      return;
    }

    setIsGenerating(true);
    toast.loading('Gerando PDF...', { id: 'pdf-toast' });
    try {
      const { jsPDF } = await import('jspdf');

      // A3 landscape: 420 x 297 mm
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a3' });
      const pageW = 420;
      const pageH = 297;
      const margin = 12;

      // Apply all filters
      let filteredEvents = events;
      if (selectedCategoryId) filteredEvents = filteredEvents.filter(e => e.categoryId === selectedCategoryId);
      if (selectedMacroId) filteredEvents = filteredEvents.filter(e => e.macroId === selectedMacroId);
      if (selectedMicroId) filteredEvents = filteredEvents.filter(e => e.microId === selectedMicroId);

      const selectedCategory = categories.find(c => c.id === selectedCategoryId);
      const selectedMacro = macros.find(m => m.id === selectedMacroId);
      const selectedMicro = micros.find(m => m.id === selectedMicroId);

      // ─── White background ───
      doc.setFillColor(255, 255, 255);
      doc.rect(0, 0, pageW, pageH, 'F');

      // ─── Header bar (dark blue) ───
      const headerH = 18;
      doc.setFillColor(26, 54, 93);
      doc.rect(0, 0, pageW, headerH, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(255, 255, 255);

      // Build title from filters
      let title = `CALENDÁRIO DE PROCESSOS SELETIVOS ${currentYear}`;
      if (selectedCategory) title = `CALENDÁRIO ${selectedCategory.name.toUpperCase()} ${currentYear}`;
      if (selectedMacro) title += ` · ${selectedMacro.name}`;
      if (selectedMicro) title += ` · ${selectedMicro.name}`;

      doc.text(title, margin, 11.5);

      doc.setFontSize(7.5);
      doc.setTextColor(180, 200, 225);
      doc.text('Universidade Tiradentes', pageW - margin, 11.5, { align: 'right' });

      // ─── Calendar grid area ───
      const cols = 4;
      const rows = 3;
      const gapX = 4;
      const gapY = 4;
      const calTop = headerH + 4;
      const panelH = 88; // dark blue panel at bottom
      const calBottom = pageH - panelH - 4;
      const cellW = (pageW - margin * 2 - gapX * (cols - 1)) / cols;
      const cellH = (calBottom - calTop - gapY * (rows - 1)) / rows;

      for (let monthIdx = 0; monthIdx < 12; monthIdx++) {
        const col = monthIdx % cols;
        const row = Math.floor(monthIdx / cols);
        const x = margin + col * (cellW + gapX);
        const y = calTop + row * (cellH + gapY);

        // Month cell border
        doc.setDrawColor(210, 215, 225);
        doc.setLineWidth(0.25);
        doc.rect(x, y, cellW, cellH);

        // Month name header (dark blue strip)
        doc.setFillColor(26, 54, 93);
        doc.rect(x, y, cellW, 6, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(255, 255, 255);
        doc.text(MONTH_NAMES_PT[monthIdx], x + cellW / 2, y + 4.2, { align: 'center' });

        // Day column headers (D S T Q Q S S)
        const dayW = (cellW - 4) / 7;
        const dayStartY = y + 9.5;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(4.5);
        doc.setTextColor(120, 130, 145);
        for (let d = 0; d < 7; d++) {
          doc.text(DAY_HEADERS[d], x + 2 + d * dayW + dayW / 2, dayStartY, { align: 'center' });
        }

        // Separator
        doc.setDrawColor(220, 225, 230);
        doc.setLineWidth(0.15);
        doc.line(x + 1, dayStartY + 1.5, x + cellW - 1, dayStartY + 1.5);

        // Day cells
        const firstDay = new Date(currentYear, monthIdx, 1);
        const startDow = firstDay.getDay();
        const daysInMonth = new Date(currentYear, monthIdx + 1, 0).getDate();
        const dayCellH = (cellH - 15) / 6;

        for (let day = 1; day <= daysInMonth; day++) {
          const dow = (startDow + day - 1) % 7;
          const week = Math.floor((startDow + day - 1) / 7);
          const dx = x + 2 + dow * dayW;
          const dy = dayStartY + 4 + week * dayCellH;

          const dateStr = `${currentYear}-${String(monthIdx + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const dayEvts = filteredEvents.filter(e => dateStr >= e.date && dateStr <= (e.endDate || e.date));

          if (dayEvts.length > 0) {
            const evtCat = categories.find(c => c.id === dayEvts[0].categoryId);
            if (evtCat) {
              const [r, g, b] = hslToRgb(evtCat.color);
              doc.setFillColor(r, g, b);
              const sz = Math.min(dayW - 0.6, dayCellH - 0.4);
              doc.roundedRect(dx + (dayW - sz) / 2, dy - sz * 0.75, sz, sz, 0.8, 0.8, 'F');
              doc.setTextColor(255, 255, 255);
            }
          } else {
            doc.setTextColor(50, 55, 65);
          }

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(5);
          doc.text(String(day), dx + dayW / 2, dy, { align: 'center' });
        }
      }

      // ─── Dark blue bottom panel ───
      const panelY = pageH - panelH;
      doc.setFillColor(26, 54, 93);
      doc.rect(0, panelY, pageW, panelH, 'F');

      // ─── Events list in dark panel — 2 columns ───
      if (filteredEvents.length > 0) {
        const eventsByMonth: Record<number, typeof filteredEvents> = {};
        filteredEvents.forEach(evt => {
          const m = Number(evt.date.slice(5, 7)) - 1;
          if (!eventsByMonth[m]) eventsByMonth[m] = [];
          if (!eventsByMonth[m].find(e => e.id === evt.id)) eventsByMonth[m].push(evt);
        });

        const sortedMonths = Object.keys(eventsByMonth).map(Number).sort((a, b) => a - b);

        // Divide months into left and right columns
        const half = Math.ceil(sortedMonths.length / 2);
        const leftMonths = sortedMonths.slice(0, half);
        const rightMonths = sortedMonths.slice(half);

        const colW = (pageW - margin * 2) / 2;
        const panelMarginTop = 7;
        const rowH = 4.2;
        const badgeSize = 5.5;

        const drawColumn = (months: number[], startX: number) => {
          let yPos = panelY + panelMarginTop;
          const maxY = pageH - 5;

          months.forEach(month => {
            const monthEvts = eventsByMonth[month].sort((a, b) => a.date.localeCompare(b.date));

            if (yPos + 6 > maxY) return;

            // Month header (gold / underline style)
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(7);
            doc.setTextColor(255, 213, 90); // golden yellow
            doc.text(MONTH_NAMES_CAP[month], startX, yPos);

            // Underline
            doc.setDrawColor(255, 213, 90);
            doc.setLineWidth(0.3);
            const textW = doc.getTextWidth(MONTH_NAMES_CAP[month]);
            doc.line(startX, yPos + 0.8, startX + textW, yPos + 0.8);

            yPos += 4.5;

            monthEvts.forEach(evt => {
              if (yPos + rowH > maxY) return;

              const cat = categories.find(c => c.id === evt.categoryId);
              const dayNum = evt.date.split('-')[2];

              if (cat) {
                const [r, g, b] = hslToRgb(cat.color);
                doc.setFillColor(r, g, b);
                doc.roundedRect(startX, yPos - badgeSize * 0.78, badgeSize, badgeSize, 0.7, 0.7, 'F');
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(4.8);
                doc.setTextColor(255, 255, 255);
                doc.text(dayNum, startX + badgeSize / 2, yPos - 0.4, { align: 'center' });
              } else {
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(5);
                doc.setTextColor(255, 255, 255);
                doc.text(dayNum, startX + 1, yPos);
              }

              // Event title text
              doc.setFont('helvetica', 'normal');
              doc.setFontSize(5);
              const isHighlight = evt.link !== undefined && evt.link !== null; // events with links are "highlighted"
              doc.setTextColor(isHighlight ? 90 : 220, isHighlight ? 210 : 225, isHighlight ? 255 : 240);
              const maxTitleW = colW - badgeSize - 5;
              const safeTitle = evt.title || 'Evento sem título';
              const titleText = doc.splitTextToSize(safeTitle, maxTitleW)[0];
              doc.text(titleText, startX + badgeSize + 2, yPos - 0.4);

              yPos += rowH;
            });

            yPos += 2;
          });
        };

        drawColumn(leftMonths, margin);
        drawColumn(rightMonths, margin + colW);
      }

      // ─── Legend (inside dark panel, top-right area) ───
      const usedCategories = selectedCategoryId
        ? categories.filter(c => c.id === selectedCategoryId)
        : categories.filter(c => filteredEvents.some(e => e.categoryId === c.id));

      if (usedCategories.length > 0) {
        let legX = margin;
        const legY = panelY - 6;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(6);
        doc.setTextColor(26, 54, 93);
        doc.text('LEGENDA:', legX, legY);
        legX += 18;

        usedCategories.forEach(cat => {
          const [r, g, b] = hslToRgb(cat.color);
          doc.setFillColor(r, g, b);
          doc.roundedRect(legX, legY - 3.2, 3.5, 3.5, 0.5, 0.5, 'F');
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(6);
          doc.setTextColor(50, 55, 65);
          doc.text(cat.name, legX + 5, legY);
          legX += doc.getTextWidth(cat.name) + 11;
        });
      }

      // ─── Save ───
      const filters = [
        selectedCategory?.name.toLowerCase().replace(/\s/g, '-'),
        selectedMacro?.name.toLowerCase(),
        selectedMicro?.name.toLowerCase().replace(/\s/g, '-'),
      ].filter(Boolean).join('-');

      doc.save(`calendario-${currentYear}${filters ? `-${filters}` : ''}.pdf`);
      toast.success('Calendário em PDF gerado com sucesso!', { id: 'pdf-toast' });
      setIsOpen(false);
    } catch (error) {
      console.error('Error generating PDF:', error);
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

        <div className="space-y-4 pt-2">

          {/* Category filter */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
              Categoria
            </label>
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              <button
                onClick={() => setSelectedCategoryId('')}
                className={cn(
                  "flex items-center gap-2 w-full p-2.5 rounded-lg transition-all text-sm",
                  !selectedCategoryId
                    ? "bg-primary/10 border border-primary/30 text-primary font-medium"
                    : "bg-muted/50 hover:bg-muted text-foreground"
                )}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-primary to-accent" />
                Todas as categorias
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategoryId(category.id)}
                  className={cn(
                    "flex items-center gap-2 w-full p-2.5 rounded-lg transition-all text-sm",
                    selectedCategoryId === category.id
                      ? "bg-primary/10 border border-primary/30 font-medium"
                      : "bg-muted/50 hover:bg-muted text-foreground"
                  )}
                  style={selectedCategoryId === category.id ? { color: `hsl(${category.color})` } : undefined}
                >
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: `hsl(${category.color})` }} />
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* IES filter */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
              <Filter className="w-3 h-3 inline mr-1" />IES (Macro)
            </label>
            <Select value={selectedMacroId} onValueChange={(v) => { setSelectedMacroId(v); setSelectedMicroId(''); }}>
              <SelectTrigger className="h-9 rounded-xl text-sm">
                <SelectValue placeholder="Todas as IES" />
              </SelectTrigger>
              <SelectContent className="bg-popover border border-border shadow-lg z-50">
                <SelectItem value="">Todas as IES</SelectItem>
                {macros.map(opt => (
                  <SelectItem key={opt.id} value={opt.id}>{opt.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Location filter */}
          {micros.length > 0 && (
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                <Filter className="w-3 h-3 inline mr-1" />Local (Micro)
              </label>
              <Select value={selectedMicroId} onValueChange={setSelectedMicroId}>
                <SelectTrigger className="h-9 rounded-xl text-sm">
                  <SelectValue placeholder="Todos os locais" />
                </SelectTrigger>
                <SelectContent className="bg-popover border border-border shadow-lg z-50">
                  <SelectItem value="">Todos os locais</SelectItem>
                  {micros
                    .filter(loc => !selectedMacroId || loc.macroId === selectedMacroId)
                    .map(loc => (
                      <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            PDF A3 paisagem — 12 meses com painel de eventos no modelo institucional.
          </div>

          <Button onClick={generatePdf} disabled={isGenerating} className="w-full rounded-lg">
            {isGenerating ? 'Gerando...' : 'Baixar PDF'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
