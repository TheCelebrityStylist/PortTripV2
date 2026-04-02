import { useEffect } from 'react';

// Tally form embed component
// Pass your Tally form ID as formId prop
// Get it from: https://tally.so → your form → Share → Embed
export default function TallyEmbed({ formId, height = 500, className = '' }) {
  useEffect(() => {
    // Load Tally embed script
    const existing = document.getElementById('tally-js');
    if (!existing) {
      const script = document.createElement('script');
      script.id = 'tally-js';
      script.src = 'https://tally.so/widgets/embed.js';
      script.async = true;
      document.body.appendChild(script);
    } else if (window.Tally) {
      window.Tally.loadEmbeds();
    }
  }, [formId]);

  if (!formId) {
    return (
      <div className={`rounded-xl border border-dashed border-border/50 p-8 text-center ${className}`}>
        <p className="text-sm text-muted-foreground mb-2">Tally Form</p>
        <p className="text-xs text-muted-foreground/60">
          Add your Tally form ID to display the form here.<br />
          Get it from tally.so → Share → Embed
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      <iframe
        data-tally-src={`https://tally.so/embed/${formId}?alignLeft=1&hideTitle=1&transparentBackground=1&dynamicHeight=1`}
        loading="lazy"
        width="100%"
        height={height}
        frameBorder="0"
        marginHeight="0"
        marginWidth="0"
        title="Port Day Planner Form"
        className="rounded-xl"
      />
    </div>
  );
}