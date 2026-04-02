import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Upload, CheckCircle, AlertCircle, Loader2, Sparkles, RefreshCw, Plus } from 'lucide-react';

const SEED_PORTS = [
  { city: 'Barcelona', country_code: 'es', region: 'Mediterranean', language: 'Spanish/Catalan', currency: 'EUR', time_zone: 'CET', typical_docking_hours: 10, tender_port: false, avg_ship_excursion_price: 119, avg_diy_cost: 32 },
  { city: 'Santorini', country_code: 'gr', region: 'Mediterranean', language: 'Greek', currency: 'EUR', time_zone: 'EET', typical_docking_hours: 8, tender_port: true, avg_ship_excursion_price: 129, avg_diy_cost: 40 },
  { city: 'Dubrovnik', country_code: 'hr', region: 'Mediterranean', language: 'Croatian', currency: 'EUR', time_zone: 'CET', typical_docking_hours: 9, tender_port: false, avg_ship_excursion_price: 109, avg_diy_cost: 28 },
  { city: 'Kotor', country_code: 'me', region: 'Mediterranean', language: 'Montenegrin', currency: 'EUR', time_zone: 'CET', typical_docking_hours: 8, tender_port: false, avg_ship_excursion_price: 89, avg_diy_cost: 22 },
  { city: 'Venice', country_code: 'it', region: 'Mediterranean', language: 'Italian', currency: 'EUR', time_zone: 'CET', typical_docking_hours: 10, tender_port: false, avg_ship_excursion_price: 129, avg_diy_cost: 35 },
  { city: 'Naples', country_code: 'it', region: 'Mediterranean', language: 'Italian', currency: 'EUR', time_zone: 'CET', typical_docking_hours: 9, tender_port: false, avg_ship_excursion_price: 119, avg_diy_cost: 30 },
  { city: 'Rome', country_code: 'it', region: 'Mediterranean', language: 'Italian', currency: 'EUR', time_zone: 'CET', typical_docking_hours: 10, tender_port: false, avg_ship_excursion_price: 139, avg_diy_cost: 38 },
  { city: 'Genoa', country_code: 'it', region: 'Mediterranean', language: 'Italian', currency: 'EUR', time_zone: 'CET', typical_docking_hours: 8, tender_port: false, avg_ship_excursion_price: 99, avg_diy_cost: 25 },
  { city: 'Palermo', country_code: 'it', region: 'Mediterranean', language: 'Italian', currency: 'EUR', time_zone: 'CET', typical_docking_hours: 9, tender_port: false, avg_ship_excursion_price: 99, avg_diy_cost: 24 },
  { city: 'Marseille', country_code: 'fr', region: 'Mediterranean', language: 'French', currency: 'EUR', time_zone: 'CET', typical_docking_hours: 9, tender_port: false, avg_ship_excursion_price: 109, avg_diy_cost: 28 },
  { city: 'Nice', country_code: 'fr', region: 'Mediterranean', language: 'French', currency: 'EUR', time_zone: 'CET', typical_docking_hours: 8, tender_port: false, avg_ship_excursion_price: 119, avg_diy_cost: 35 },
  { city: 'Alicante', country_code: 'es', region: 'Mediterranean', language: 'Spanish', currency: 'EUR', time_zone: 'CET', typical_docking_hours: 9, tender_port: false, avg_ship_excursion_price: 99, avg_diy_cost: 22 },
  { city: 'Malaga', country_code: 'es', region: 'Mediterranean', language: 'Spanish', currency: 'EUR', time_zone: 'CET', typical_docking_hours: 9, tender_port: false, avg_ship_excursion_price: 109, avg_diy_cost: 26 },
  { city: 'Valencia', country_code: 'es', region: 'Mediterranean', language: 'Spanish', currency: 'EUR', time_zone: 'CET', typical_docking_hours: 9, tender_port: false, avg_ship_excursion_price: 99, avg_diy_cost: 24 },
  { city: 'Lisbon', country_code: 'pt', region: 'Atlantic', language: 'Portuguese', currency: 'EUR', time_zone: 'WET', typical_docking_hours: 10, tender_port: false, avg_ship_excursion_price: 109, avg_diy_cost: 28 },
  { city: 'Porto', country_code: 'pt', region: 'Atlantic', language: 'Portuguese', currency: 'EUR', time_zone: 'WET', typical_docking_hours: 9, tender_port: false, avg_ship_excursion_price: 99, avg_diy_cost: 24 },
  { city: 'Athens', country_code: 'gr', region: 'Mediterranean', language: 'Greek', currency: 'EUR', time_zone: 'EET', typical_docking_hours: 10, tender_port: false, avg_ship_excursion_price: 119, avg_diy_cost: 30 },
  { city: 'Mykonos', country_code: 'gr', region: 'Mediterranean', language: 'Greek', currency: 'EUR', time_zone: 'EET', typical_docking_hours: 8, tender_port: true, avg_ship_excursion_price: 109, avg_diy_cost: 38 },
  { city: 'Rhodes', country_code: 'gr', region: 'Mediterranean', language: 'Greek', currency: 'EUR', time_zone: 'EET', typical_docking_hours: 9, tender_port: false, avg_ship_excursion_price: 99, avg_diy_cost: 25 },
  { city: 'Corfu', country_code: 'gr', region: 'Mediterranean', language: 'Greek', currency: 'EUR', time_zone: 'EET', typical_docking_hours: 9, tender_port: false, avg_ship_excursion_price: 99, avg_diy_cost: 25 },
  { city: 'Istanbul', country_code: 'tr', region: 'Mediterranean', language: 'Turkish', currency: 'TRY', time_zone: 'TRT', typical_docking_hours: 10, tender_port: false, avg_ship_excursion_price: 119, avg_diy_cost: 20 },
  { city: 'Kusadasi', country_code: 'tr', region: 'Mediterranean', language: 'Turkish', currency: 'TRY', time_zone: 'TRT', typical_docking_hours: 9, tender_port: false, avg_ship_excursion_price: 99, avg_diy_cost: 18 },
  { city: 'Valletta', country_code: 'mt', region: 'Mediterranean', language: 'Maltese/English', currency: 'EUR', time_zone: 'CET', typical_docking_hours: 9, tender_port: false, avg_ship_excursion_price: 99, avg_diy_cost: 22 },
  { city: 'Bergen', country_code: 'no', region: 'Norway & Nordics', language: 'Norwegian', currency: 'NOK', time_zone: 'CET', typical_docking_hours: 9, tender_port: false, avg_ship_excursion_price: 119, avg_diy_cost: 35 },
  { city: 'Alesund', country_code: 'no', region: 'Norway & Nordics', language: 'Norwegian', currency: 'NOK', time_zone: 'CET', typical_docking_hours: 8, tender_port: false, avg_ship_excursion_price: 109, avg_diy_cost: 30 },
  { city: 'Flam', country_code: 'no', region: 'Norway & Nordics', language: 'Norwegian', currency: 'NOK', time_zone: 'CET', typical_docking_hours: 7, tender_port: false, avg_ship_excursion_price: 129, avg_diy_cost: 45 },
  { city: 'Tromso', country_code: 'no', region: 'Norway & Nordics', language: 'Norwegian', currency: 'NOK', time_zone: 'CET', typical_docking_hours: 9, tender_port: false, avg_ship_excursion_price: 119, avg_diy_cost: 32 },
  { city: 'Copenhagen', country_code: 'dk', region: 'Northern Europe', language: 'Danish', currency: 'DKK', time_zone: 'CET', typical_docking_hours: 10, tender_port: false, avg_ship_excursion_price: 119, avg_diy_cost: 38 },
  { city: 'Stockholm', country_code: 'se', region: 'Northern Europe', language: 'Swedish', currency: 'SEK', time_zone: 'CET', typical_docking_hours: 10, tender_port: false, avg_ship_excursion_price: 119, avg_diy_cost: 35 },
  { city: 'Amsterdam', country_code: 'nl', region: 'Northern Europe', language: 'Dutch', currency: 'EUR', time_zone: 'CET', typical_docking_hours: 10, tender_port: false, avg_ship_excursion_price: 109, avg_diy_cost: 30 },
  { city: 'Reykjavik', country_code: 'is', region: 'Northern Europe', language: 'Icelandic', currency: 'ISK', time_zone: 'GMT', typical_docking_hours: 10, tender_port: false, avg_ship_excursion_price: 149, avg_diy_cost: 50 },
  { city: 'Nassau', country_code: 'bs', region: 'Caribbean', language: 'English', currency: 'BSD', time_zone: 'EST', typical_docking_hours: 9, tender_port: false, avg_ship_excursion_price: 99, avg_diy_cost: 28 },
  { city: 'Cozumel', country_code: 'mx', region: 'Caribbean', language: 'Spanish', currency: 'MXN', time_zone: 'CST', typical_docking_hours: 9, tender_port: false, avg_ship_excursion_price: 109, avg_diy_cost: 25 },
  { city: 'Barbados', country_code: 'bb', region: 'Caribbean', language: 'English', currency: 'BBD', time_zone: 'AST', typical_docking_hours: 9, tender_port: false, avg_ship_excursion_price: 99, avg_diy_cost: 28 },
  { city: 'Split', country_code: 'hr', region: 'Mediterranean', language: 'Croatian', currency: 'EUR', time_zone: 'CET', typical_docking_hours: 9, tender_port: false, avg_ship_excursion_price: 89, avg_diy_cost: 22 },
  { city: 'Civitavecchia', country_code: 'it', region: 'Mediterranean', language: 'Italian', currency: 'EUR', time_zone: 'CET', typical_docking_hours: 10, tender_port: false, avg_ship_excursion_price: 139, avg_diy_cost: 38 },
  { city: 'Livorno', country_code: 'it', region: 'Mediterranean', language: 'Italian', currency: 'EUR', time_zone: 'CET', typical_docking_hours: 9, tender_port: false, avg_ship_excursion_price: 119, avg_diy_cost: 30 },
  { city: 'Catania', country_code: 'it', region: 'Mediterranean', language: 'Italian', currency: 'EUR', time_zone: 'CET', typical_docking_hours: 9, tender_port: false, avg_ship_excursion_price: 99, avg_diy_cost: 24 },
  { city: 'Messina', country_code: 'it', region: 'Mediterranean', language: 'Italian', currency: 'EUR', time_zone: 'CET', typical_docking_hours: 8, tender_port: false, avg_ship_excursion_price: 99, avg_diy_cost: 22 },
  { city: 'Madeira', country_code: 'pt', region: 'Atlantic', language: 'Portuguese', currency: 'EUR', time_zone: 'WET', typical_docking_hours: 9, tender_port: false, avg_ship_excursion_price: 99, avg_diy_cost: 28 },
  { city: 'Cartagena', country_code: 'es', region: 'Mediterranean', language: 'Spanish', currency: 'EUR', time_zone: 'CET', typical_docking_hours: 8, tender_port: false, avg_ship_excursion_price: 89, avg_diy_cost: 18 },
  { city: 'Cadiz', country_code: 'es', region: 'Atlantic', language: 'Spanish', currency: 'EUR', time_zone: 'CET', typical_docking_hours: 9, tender_port: false, avg_ship_excursion_price: 109, avg_diy_cost: 25 },
  { city: 'Bari', country_code: 'it', region: 'Mediterranean', language: 'Italian', currency: 'EUR', time_zone: 'CET', typical_docking_hours: 9, tender_port: false, avg_ship_excursion_price: 89, avg_diy_cost: 20 },
  { city: 'Bodrum', country_code: 'tr', region: 'Mediterranean', language: 'Turkish', currency: 'TRY', time_zone: 'TRT', typical_docking_hours: 9, tender_port: false, avg_ship_excursion_price: 99, avg_diy_cost: 18 },
];

export default function AdminImport() {
  const [log, setLog] = useState([]);
  const [file, setFile] = useState(null);
  const [importStatus, setImportStatus] = useState('idle');
  const [genStatus, setGenStatus] = useState({});
  const [genRunning, setGenRunning] = useState(false);
  const [seedRunning, setSeedRunning] = useState(false);

  const { data: ports = [], refetch: refetchPorts } = useQuery({
    queryKey: ['cruisePorts', 'admin'],
    queryFn: () => base44.entities.CruisePort.list('city', 500),
  });

  const addLog = (msg) => setLog(prev => [...prev, msg]);

  const handleSeedPorts = async () => {
    setSeedRunning(true);
    addLog('Seeding cruise ports…');
    let created = 0;
    for (const p of SEED_PORTS) {
      const existing = ports.find(x => x.city?.toLowerCase() === p.city.toLowerCase());
      if (!existing) {
        await base44.entities.CruisePort.create(p);
        created++;
        addLog(`✓ Seeded: ${p.city}`);
      } else {
        addLog(`— Skipped (exists): ${p.city}`);
      }
    }
    addLog(`✅ Done! ${created} new ports seeded.`);
    refetchPorts();
    setSeedRunning(false);
  };

  const handleGenOne = async (port, overwrite = false) => {
    setGenStatus(s => ({ ...s, [port.id]: 'loading' }));
    try {
      const result = await base44.functions.invoke('generatePortContent', { port_id: port.id, overwrite });
      if (result?.data?.success || result?.data?.skipped) {
        setGenStatus(s => ({ ...s, [port.id]: result.data.skipped ? 'skipped' : 'done' }));
        addLog(`✅ ${port.city}: ${result.data.skipped ? 'skipped' : 'done'}`);
      } else {
        setGenStatus(s => ({ ...s, [port.id]: 'error' }));
        addLog(`❌ ${port.city}: ${result?.data?.error || 'failed'}`);
      }
    } catch (err) {
      setGenStatus(s => ({ ...s, [port.id]: 'error' }));
      addLog(`❌ ${port.city}: ${err.message}`);
    }
  };

  const genWithRetry = async (port) => {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        return await base44.functions.invoke('generatePortContent', { port_id: port.id });
      } catch (err) {
        if (attempt === 2) throw err;
        addLog(`⚠️ Timeout on ${port.city}, retrying…`);
        await new Promise(r => setTimeout(r, 3000));
      }
    }
  };

  const handleGenAll = async () => {
    setGenRunning(true);
    const missing = ports.filter(p => !p.description || p.description.length < 100);
    addLog(`Generating content for ${missing.length} ports missing content…`);
    for (const port of missing) {
      addLog(`⏳ Generating: ${port.city}…`);
      setGenStatus(s => ({ ...s, [port.id]: 'loading' }));
      try {
        const result = await genWithRetry(port);
        if (result?.data?.success) {
          setGenStatus(s => ({ ...s, [port.id]: 'done' }));
          addLog(`✅ Done: ${port.city} (${result.data.contentLength?.toLocaleString()} chars)`);
        } else if (result?.data?.skipped) {
          setGenStatus(s => ({ ...s, [port.id]: 'skipped' }));
          addLog(`— Skipped: ${port.city}`);
        } else {
          setGenStatus(s => ({ ...s, [port.id]: 'error' }));
          addLog(`❌ Failed: ${port.city} — ${result?.data?.error || 'unknown error'}`);
        }
      } catch (err) {
        setGenStatus(s => ({ ...s, [port.id]: 'error' }));
        addLog(`❌ Error: ${port.city} — ${err.message}`);
      }
      await new Promise(r => setTimeout(r, 1000));
    }
    addLog('🎉 All ports processed!');
    refetchPorts();
    setGenRunning(false);
  };

  const handleImport = async () => {
    if (!file) return;
    setImportStatus('loading');
    try {
      addLog('Uploading file...');
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      addLog('Extracting port data...');
      const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: { type: 'object', properties: { ports: { type: 'array', items: { type: 'object', properties: { city: { type: 'string' }, country_code: { type: 'string' }, region: { type: 'string' } } } } } }
      });
      if (result.status !== 'success') { addLog(`❌ ${result.details}`); setImportStatus('error'); return; }
      const portData = result.output?.ports || [];
      let created = 0;
      for (let i = 0; i < portData.length; i += 10) {
        const batch = portData.slice(i, i + 10).filter(p => p.city);
        if (batch.length) { await base44.entities.CruisePort.bulkCreate(batch); created += batch.length; }
      }
      addLog(`✅ ${created} ports imported.`);
      setImportStatus('success');
      refetchPorts();
    } catch (err) {
      addLog(`❌ ${err.message}`);
      setImportStatus('error');
    }
  };

  const missingContent = ports.filter(p => !p.description || p.description.length < 100);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-black text-foreground mb-1">Admin — Port Management</h1>
          <p className="text-sm text-muted-foreground">{ports.length} ports · {missingContent.length} missing content</p>
        </div>

        {/* Seed ports */}
        <div className="rounded-2xl border border-border/40 bg-card/50 p-6 space-y-4">
          <h2 className="text-base font-bold text-foreground">Seed {SEED_PORTS.length} Cruise Ports</h2>
          <p className="text-sm text-muted-foreground">Creates all the major cruise ports (skeleton data only, no content yet).</p>
          <Button onClick={handleSeedPorts} disabled={seedRunning} className="gap-2">
            {seedRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Seed all cruise ports
          </Button>
        </div>

        {/* Generate content */}
        <div className="rounded-2xl border border-border/40 bg-card/50 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-foreground">AI Content Generator</h2>
              <p className="text-sm text-muted-foreground">{missingContent.length} ports need content · Uses Claude Sonnet for 5000+ word guides</p>
            </div>
            <Button onClick={handleGenAll} disabled={genRunning || missingContent.length === 0} className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2">
              {genRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              Generate all missing ({missingContent.length})
            </Button>
          </div>

          {log.length > 0 && (
            <div className="bg-muted/50 rounded-lg p-3 max-h-48 overflow-y-auto space-y-1">
              {log.map((line, i) => <p key={i} className="text-xs font-mono text-muted-foreground">{line}</p>)}
            </div>
          )}

          {ports.length > 0 && (
            <div className="max-h-96 overflow-y-auto space-y-1.5 pr-1">
              {ports.map(port => {
                const hasContent = port.description && port.description.length > 100;
                const s = genStatus[port.id];
                return (
                  <div key={port.id} className="flex items-center justify-between rounded-xl border border-border/30 bg-background/40 px-4 py-2.5">
                    <div>
                      <span className="text-sm font-semibold text-foreground">{port.city}</span>
                      <span className="text-xs text-muted-foreground ml-2">{port.region}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {s === 'loading' && <Loader2 className="w-4 h-4 text-accent animate-spin" />}
                      {s === 'done' && <CheckCircle className="w-4 h-4 text-green-400" />}
                      {s === 'error' && <AlertCircle className="w-4 h-4 text-red-400" />}
                      {s === 'skipped' && <span className="text-xs text-muted-foreground">skipped</span>}
                      {!s && (
                        <>
                          {hasContent
                            ? <span className="text-[10px] text-green-400 font-bold bg-green-400/10 px-2 py-0.5 rounded-full">Has content</span>
                            : <span className="text-[10px] text-yellow-400 font-bold bg-yellow-400/10 px-2 py-0.5 rounded-full">No content</span>
                          }
                          <Button size="sm" variant="ghost" onClick={() => handleGenOne(port, false)} className="h-7 text-xs">
                            <Sparkles className="w-3 h-3 mr-1" /> Generate
                          </Button>
                          {hasContent && (
                            <Button size="sm" variant="ghost" onClick={() => handleGenOne(port, true)} className="h-7 text-xs text-muted-foreground">
                              <RefreshCw className="w-3 h-3 mr-1" /> Regen
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Excel import */}
        <div className="rounded-2xl border border-border/40 bg-card/50 p-6 space-y-4">
          <h2 className="text-base font-bold text-foreground">Import from Excel</h2>
          <input type="file" accept=".xlsx,.xls" onChange={e => setFile(e.target.files[0])}
            className="block w-full text-sm text-muted-foreground file:mr-3 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:bg-accent file:text-accent-foreground" />
          <Button onClick={handleImport} disabled={!file || importStatus === 'loading'} className="gap-2">
            {importStatus === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            Import ports
          </Button>
        </div>
      </div>
    </div>
  );
}