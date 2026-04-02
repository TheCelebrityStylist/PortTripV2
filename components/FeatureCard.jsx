export default function FeatureCard({ icon: Icon, title, description }) {
  return (
    <div className="p-5 rounded-xl border border-border/50 bg-card/60 hover:bg-card hover:border-border transition-all duration-200 group">
      <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center mb-3 group-hover:bg-accent/20 transition-colors">
        <Icon className="w-4.5 h-4.5 text-accent" />
      </div>
      <h3 className="text-sm font-semibold text-foreground mb-1.5">{title}</h3>
      <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}