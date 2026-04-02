import { format, differenceInMinutes, parseISO } from 'date-fns';
import {
  Plane, Train, Bus, Car, Ship, Bike, Footprints, Clock,
  MapPin, Coffee, Camera, Utensils, Bed, ShoppingBag, Flag
} from 'lucide-react';

const TRANSPORT_ICONS = {
  flight: Plane,
  train: Train,
  bus: Bus,
  drive: Car,
  ferry: Ship,
  bike: Bike,
  walk: Footprints,
  taxi: Car,
};

const BLOCK_TYPE_ICONS = {
  arrival: Plane,
  departure: Flag,
  stop: MapPin,
  transfer: Train,
  buffer: Coffee,
  transit: Car,
};

const MIN_SPACING = 48;
const MAX_SPACING = 240;
const MINUTES_PER_PX = 1.5;

export function mapBlocksToNodes(planBlocks) {
  if (!planBlocks || planBlocks.length === 0) return [];

  const sorted = [...planBlocks].sort((a, b) => a.order_index - b.order_index);

  return sorted.map((block, index) => {
    const nextBlock = sorted[index + 1];
    const gapMinutes = nextBlock && block.end_time && nextBlock.start_time
      ? differenceInMinutes(parseISO(nextBlock.start_time), parseISO(block.end_time))
      : 0;

    const spacingAfter = Math.min(
      MAX_SPACING,
      Math.max(MIN_SPACING, gapMinutes / MINUTES_PER_PX)
    );

    const durationMinutes = block.duration_minutes ||
      (block.start_time && block.end_time
        ? differenceInMinutes(parseISO(block.end_time), parseISO(block.start_time))
        : 0);

    const Icon = block.block_type === 'transit' && block.transport_mode
      ? TRANSPORT_ICONS[block.transport_mode] || Car
      : BLOCK_TYPE_ICONS[block.block_type] || MapPin;

    return {
      id: block.id,
      blockType: block.block_type,
      title: block.title,
      subtitle: block.subtitle || '',
      location: block.location || '',
      startTime: block.start_time ? format(parseISO(block.start_time), 'h:mm a') : '',
      endTime: block.end_time ? format(parseISO(block.end_time), 'h:mm a') : '',
      rawStartTime: block.start_time,
      rawEndTime: block.end_time,
      durationMinutes,
      durationLabel: formatDuration(durationMinutes),
      spacingAfter: index < sorted.length - 1 ? spacingAfter : 0,
      Icon,
      transportMode: block.transport_mode || '',
      notes: block.notes || '',
      status: block.status || 'planned',
      colorTag: block.color_tag || '',
      costEstimate: block.cost_estimate,
      imageUrl: block.image_url || '',
      isFirst: index === 0,
      isLast: index === sorted.length - 1,
      orderIndex: block.order_index,
    };
  });
}

function formatDuration(minutes) {
  if (!minutes || minutes <= 0) return '';
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function groupNodesByDay(nodes) {
  const groups = {};
  nodes.forEach(node => {
    if (!node.rawStartTime) {
      const key = 'unscheduled';
      if (!groups[key]) groups[key] = { label: 'Unscheduled', nodes: [] };
      groups[key].nodes.push(node);
      return;
    }
    const date = parseISO(node.rawStartTime);
    const key = format(date, 'yyyy-MM-dd');
    if (!groups[key]) {
      groups[key] = {
        label: format(date, 'EEEE, MMMM d'),
        date: key,
        nodes: [],
      };
    }
    groups[key].nodes.push(node);
  });
  return Object.values(groups).sort((a, b) => {
    if (a.date === 'unscheduled') return 1;
    if (b.date === 'unscheduled') return -1;
    return a.date.localeCompare(b.date);
  });
}