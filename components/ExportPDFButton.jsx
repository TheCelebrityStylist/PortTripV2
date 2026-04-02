import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { jsPDF } from 'jspdf';

function stripHtml(html) {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function formatTime(timeStr) {
  if (!timeStr) return '';
  try {
    return new Date(timeStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  } catch { return timeStr; }
}

export default function ExportPDFButton({ plan, blocks, port, className }) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = 210;
    const margin = 18;
    const contentW = pageW - margin * 2;
    let y = 0;

    const addPage = () => {
      doc.addPage();
      y = margin;
    };

    const checkPageBreak = (needed = 10) => {
      if (y + needed > 275) addPage();
    };

    // ─── Header ───────────────────────────────────────────
    doc.setFillColor(15, 23, 42); // dark navy
    doc.rect(0, 0, 210, 42, 'F');

    doc.setTextColor(251, 146, 60); // accent amber
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('PortTrip', margin, 18);

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.text(plan?.port_city || 'Port Day Plan', margin, 28);

    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    const meta = [
      plan?.all_aboard_time ? `All Aboard: ${plan.all_aboard_time}` : null,
      plan?.travel_mode ? `Style: ${plan.travel_mode.replace('_', ' ')}` : null,
      plan?.group_type ? `Group: ${plan.group_type.replace('_', ' ')}` : null,
    ].filter(Boolean).join('  ·  ');
    doc.text(meta, margin, 37);

    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8);
    doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`, pageW - margin, 37, { align: 'right' });

    y = 52;

    // ─── Safety Timer ─────────────────────────────────────
    if (plan?.all_aboard_time) {
      const allAboard = new Date(`2000-01-01T${plan.all_aboard_time}`);
      const buffer = (plan.buffer_minutes || 90) + (plan.tender_delay_minutes || 0);
      const mustReturn = new Date(allAboard.getTime() - buffer * 60000);
      const returnStr = mustReturn.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

      doc.setFillColor(251, 146, 60, 0.1);
      doc.setDrawColor(251, 146, 60);
      doc.roundedRect(margin, y, contentW, 20, 2, 2, 'FD');

      doc.setTextColor(251, 146, 60);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('⏱ Return-to-Ship Safety Timer', margin + 5, y + 7);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);
      doc.text(
        `Must return by ${returnStr}  ·  All aboard ${plan.all_aboard_time}  ·  Buffer ${plan.buffer_minutes || 90}min${plan.tender_delay_minutes ? ` + Tender ${plan.tender_delay_minutes}min` : ''}`,
        margin + 5, y + 14
      );

      y += 28;
    }

    // ─── Budget Intelligence ───────────────────────────────
    if (plan?.ship_excursion_price && plan?.diy_budget) {
      const savings = plan.ship_excursion_price - plan.diy_budget;
      if (savings > 0) {
        doc.setFillColor(34, 197, 94, 0.08);
        doc.setDrawColor(34, 197, 94);
        doc.roundedRect(margin, y, contentW, 14, 2, 2, 'FD');

        doc.setTextColor(34, 197, 94);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text(`💰 Budget: Ship tour €${plan.ship_excursion_price}  →  DIY €${plan.diy_budget}  →  You save €${savings} (${Math.round(savings / plan.ship_excursion_price * 100)}%)`, margin + 5, y + 9);
        y += 22;
      }
    }

    // ─── Itinerary ────────────────────────────────────────
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('Your Port Day Itinerary', margin, y);
    y += 8;

    // Divider
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y, pageW - margin, y);
    y += 6;

    const sorted = [...blocks].sort((a, b) => (a.order_index || 0) - (b.order_index || 0));

    sorted.forEach((block, i) => {
      checkPageBreak(22);

      const isTransit = block.block_type === 'transit';
      const isTerminal = block.block_type === 'arrival' || block.block_type === 'departure';

      if (isTerminal) {
        doc.setFillColor(15, 23, 42);
        doc.roundedRect(margin, y, contentW, 12, 1.5, 1.5, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        const timeLabel = block.start_time ? formatTime(block.start_time) : '';
        doc.text(`${timeLabel}  ${block.title.toUpperCase()}`, margin + 4, y + 8);
        y += 18;
        return;
      }

      if (isTransit) {
        doc.setTextColor(100, 116, 139);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        const dur = block.duration_minutes ? ` (${block.duration_minutes}min)` : '';
        doc.text(`   ↓  ${block.title}${dur}`, margin + 8, y + 4);
        y += 10;
        return;
      }

      // Normal stop
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      const blockH = block.notes ? 26 : 20;
      doc.roundedRect(margin, y, contentW, blockH, 1.5, 1.5, 'FD');

      // Number circle
      doc.setFillColor(30, 41, 59);
      doc.circle(margin + 6, y + blockH / 2, 4, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.text(String(i + 1), margin + 6, y + blockH / 2 + 2.5, { align: 'center' });

      // Time
      if (block.start_time) {
        doc.setTextColor(251, 146, 60);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text(formatTime(block.start_time), margin + 14, y + 7);
      }

      // Title
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      const titleX = block.start_time ? margin + 40 : margin + 14;
      const titleLines = doc.splitTextToSize(block.title, contentW - 50);
      doc.text(titleLines[0], titleX, y + 7);

      // Duration & cost
      const meta2 = [
        block.duration_minutes ? `${block.duration_minutes}min` : null,
        block.cost_estimate > 0 ? `€${block.cost_estimate}` : null,
        block.location ? block.location : null,
      ].filter(Boolean).join('  ·  ');

      doc.setTextColor(100, 116, 139);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(meta2.slice(0, 70), margin + 14, y + 14);

      // Notes
      if (block.notes) {
        doc.setTextColor(71, 85, 105);
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'italic');
        const noteLines = doc.splitTextToSize(stripHtml(block.notes), contentW - 20);
        doc.text(noteLines[0] || '', margin + 14, y + 22);
      }

      y += blockH + 4;
    });

    y += 8;

    // ─── Port Guide Info ──────────────────────────────────
    if (port) {
      checkPageBreak(20);

      doc.setFillColor(15, 23, 42);
      doc.rect(0, y - 2, 210, 12, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(`Port Guide: ${port.city}`, margin, y + 7);
      y += 18;

      const sections = [
        { label: 'Getting Port to City', content: stripHtml(port.transport_port_to_city) },
        { label: 'Safety & Security', content: stripHtml(port.safety_security) },
        { label: 'Local Tips', content: stripHtml(port.local_food) },
      ].filter(s => s.content);

      sections.forEach(section => {
        checkPageBreak(30);

        doc.setTextColor(251, 146, 60);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text(section.label, margin, y);
        y += 5;

        doc.setTextColor(51, 65, 85);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        const lines = doc.splitTextToSize(section.content.slice(0, 600), contentW);
        const maxLines = Math.min(lines.length, 8);
        doc.text(lines.slice(0, maxLines), margin, y);
        y += maxLines * 4 + 6;
      });
    }

    // ─── Footer on each page ──────────────────────────────
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 287, 210, 10, 'F');
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(7);
      doc.text('PortTrip Cruise Intelligence System', margin, 294);
      doc.text(`Page ${i} of ${totalPages}`, pageW - margin, 294, { align: 'right' });
    }

    doc.save(`porttrip-${(plan?.port_city || 'itinerary').toLowerCase().replace(/\s/g, '-')}.pdf`);
    setLoading(false);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={loading || !blocks?.length}
      className={`gap-1.5 text-xs ${className}`}
    >
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
      {loading ? 'Exporting...' : 'Export PDF'}
    </Button>
  );
}