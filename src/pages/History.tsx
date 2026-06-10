import { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { format, parseISO, getHours } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Search, Printer, Pencil, X, Check } from 'lucide-react';
import type { Receipt } from '../types';

// ----- Modal de Edição e Impressão -----
function ReceiptPrintModal({ receipt, onClose }: { receipt: Receipt; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div id="receipt-print-area" className="bg-charcoal border-2 border-acid-green p-8 max-w-sm w-full shadow-[0_0_30px_rgba(57,255,20,0.2)] relative">
        <h2 className="text-xl font-display font-bold text-white mb-6 text-center uppercase tracking-widest border-b border-lead pb-4">
          Recibo de Saída
        </h2>
        <div className="space-y-4 font-mono text-sm mb-8">
          <div className="flex justify-between">
            <span className="text-gray-400">Placa:</span>
            <span className="text-white font-bold text-lg">{receipt.placa}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Tipo:</span>
            <span className="text-white uppercase">{receipt.type || 'Carro'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Modelo:</span>
            <span className="text-white">{receipt.modelo || '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Entrada:</span>
            <span className="text-white">{format(parseISO(receipt.entryTime), 'dd/MM/yyyy HH:mm')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Saída:</span>
            <span className="text-white">{format(parseISO(receipt.exitTime), 'dd/MM/yyyy HH:mm')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Tempo:</span>
            <span className="text-white">{receipt.durationMinutes} min</span>
          </div>
          <div className="flex justify-between border-t border-dashed border-lead pt-4 mt-4 items-center">
            <span className="text-acid-green font-bold uppercase text-xs tracking-widest">Total</span>
            <span className="text-acid-green font-bold text-2xl">R$ {receipt.totalCost.toFixed(2).replace('.', ',')}</span>
          </div>
        </div>
        <div className="flex gap-4 print-hide">
          <button
            onClick={() => window.print()}
            className="flex-1 bg-acid-green hover:bg-neon-yellow text-black font-bold uppercase tracking-widest py-4 transition-colors text-xs flex items-center justify-center gap-2"
          >
            <Printer size={14} /> Imprimir
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-transparent border border-lead hover:bg-white/10 text-white font-bold uppercase tracking-widest py-4 transition-colors text-xs"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

// ----- Linha de Recibo Editável -----
function ReceiptRow({ receipt, onPrint }: { receipt: Receipt; onPrint: (r: Receipt) => void }) {
  const updateReceipt = useStore(state => state.updateReceipt);
  const [editing, setEditing] = useState(false);
  const [edited, setEdited] = useState({
    placa: receipt.placa,
    modelo: receipt.modelo || '',
    totalCost: receipt.totalCost.toFixed(2),
  });

  const handleSave = () => {
    updateReceipt(receipt.id, {
      placa: edited.placa.toUpperCase(),
      modelo: edited.modelo,
      totalCost: parseFloat(edited.totalCost) || receipt.totalCost,
    });
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-center bg-charcoal p-4 border border-acid-green/40">
        <input
          className="bg-pitch-black border border-lead text-white px-2 py-1 font-mono uppercase text-sm outline-none focus:border-acid-green"
          value={edited.placa}
          onChange={e => setEdited({ ...edited, placa: e.target.value })}
          placeholder="Placa"
        />
        <input
          className="bg-pitch-black border border-lead text-white px-2 py-1 font-mono text-sm outline-none focus:border-acid-green col-span-2"
          value={edited.modelo}
          onChange={e => setEdited({ ...edited, modelo: e.target.value })}
          placeholder="Modelo"
        />
        <div className="font-mono text-gray-300 text-sm">{format(parseISO(receipt.entryTime), 'HH:mm')} → {format(parseISO(receipt.exitTime), 'HH:mm')}</div>
        <div className="flex items-center gap-1">
          <span className="text-gray-400 font-mono text-sm">R$</span>
          <input
            type="number"
            step="0.01"
            className="bg-pitch-black border border-lead text-white px-2 py-1 font-mono text-sm w-24 outline-none focus:border-acid-green"
            value={edited.totalCost}
            onChange={e => setEdited({ ...edited, totalCost: e.target.value })}
          />
        </div>
        <div className="flex gap-2">
          <button onClick={handleSave} className="bg-acid-green hover:bg-neon-yellow text-black p-2 transition-colors" title="Salvar">
            <Check size={14} />
          </button>
          <button onClick={() => setEditing(false)} className="bg-lead hover:bg-gray-700 text-white p-2 transition-colors" title="Cancelar">
            <X size={14} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 items-center bg-pitch-black p-4 border border-lead/50 hover:border-gray-600 transition-colors group">
      <div className="col-span-2 md:col-span-1">
        <div className="text-base font-display font-bold text-white">{receipt.placa}</div>
        <div className="text-xs text-gray-500 uppercase">{receipt.type || 'carro'} · {receipt.modelo || '-'}</div>
      </div>
      <div>
        <div className="text-[10px] uppercase tracking-widest text-gray-500 font-mono">Entrada</div>
        <div className="font-mono text-gray-300 text-sm">{format(parseISO(receipt.entryTime), 'HH:mm')}</div>
      </div>
      <div>
        <div className="text-[10px] uppercase tracking-widest text-gray-500 font-mono">Saída</div>
        <div className="font-mono text-gray-300 text-sm">{format(parseISO(receipt.exitTime), 'HH:mm')}</div>
      </div>
      <div>
        <div className="text-[10px] uppercase tracking-widest text-gray-500 font-mono">Tempo</div>
        <div className="font-mono text-gray-300 text-sm">{receipt.durationMinutes} min</div>
      </div>
      <div>
        <div className="text-[10px] uppercase tracking-widest text-gray-500 font-mono">Valor</div>
        <div className="font-mono font-bold text-acid-green">R$ {receipt.totalCost.toFixed(2).replace('.', ',')}</div>
      </div>
      <div className="col-span-2 md:col-span-1 flex gap-2 justify-end">
        <button
          onClick={() => onPrint(receipt)}
          className="p-2 border border-lead hover:border-acid-green hover:text-acid-green text-gray-500 transition-colors"
          title="Reimprimir"
        >
          <Printer size={14} />
        </button>
        <button
          onClick={() => setEditing(true)}
          className="p-2 border border-lead hover:border-neon-yellow hover:text-neon-yellow text-gray-500 transition-colors"
          title="Editar"
        >
          <Pencil size={14} />
        </button>
      </div>
    </div>
  );
}

// ----- Página principal -----
export default function History() {
  const receipts = useStore(state => state.receipts);

  const [searchPlaca, setSearchPlaca] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [filterHour, setFilterHour] = useState('');
  const [printReceipt, setPrintReceipt] = useState<Receipt | null>(null);

  const filtered = useMemo(() => {
    return receipts.filter(r => {
      const placaMatch = searchPlaca
        ? r.placa.toLowerCase().includes(searchPlaca.toLowerCase())
        : true;

      const dateMatch = searchDate
        ? r.date === searchDate
        : true;

      const hourMatch = filterHour !== ''
        ? getHours(parseISO(r.entryTime)) === parseInt(filterHour)
        : true;

      return placaMatch && dateMatch && hourMatch;
    });
  }, [receipts, searchPlaca, searchDate, filterHour]);

  // Agrupado por data (apenas resultados filtrados)
  const grouped = useMemo(() => {
    const groups: Record<string, { items: Receipt[], total: number }> = {};
    const sorted = [...filtered].sort((a, b) =>
      new Date(b.entryTime).getTime() - new Date(a.entryTime).getTime()
    );
    sorted.forEach(r => {
      if (!groups[r.date]) groups[r.date] = { items: [], total: 0 };
      groups[r.date].items.push(r);
      groups[r.date].total += r.totalCost;
    });
    return Object.entries(groups).sort((a, b) =>
      new Date(b[0]).getTime() - new Date(a[0]).getTime()
    );
  }, [filtered]);

  const hasFilters = searchPlaca || searchDate || filterHour !== '';

  const totalFiltered = filtered.reduce((sum, r) => sum + r.totalCost, 0);

  const hourOptions = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      {printReceipt && (
        <ReceiptPrintModal receipt={printReceipt} onClose={() => setPrintReceipt(null)} />
      )}

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-display font-bold text-white uppercase tracking-tight">
          Histórico
        </h1>
        {hasFilters && (
          <span className="text-xs font-mono text-acid-green border border-acid-green/30 px-3 py-1">
            {filtered.length} resultado{filtered.length !== 1 ? 's' : ''} · R$ {totalFiltered.toFixed(2).replace('.', ',')}
          </span>
        )}
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 p-4 bg-charcoal border border-lead">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
            <Search size={14} />
          </div>
          <input
            type="text"
            value={searchPlaca}
            onChange={e => setSearchPlaca(e.target.value)}
            className="w-full bg-pitch-black border border-lead text-white px-4 py-2 pl-9 font-mono text-sm uppercase focus:outline-none focus:border-acid-green transition-colors"
            placeholder="Buscar por placa..."
          />
        </div>

        <div>
          <input
            type="date"
            value={searchDate}
            onChange={e => setSearchDate(e.target.value)}
            className="w-full bg-pitch-black border border-lead text-white px-4 py-2 font-mono text-sm focus:outline-none focus:border-acid-green transition-colors cursor-pointer"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={filterHour}
            onChange={e => setFilterHour(e.target.value)}
            className="flex-1 bg-pitch-black border border-lead text-white px-4 py-2 font-mono text-sm focus:outline-none focus:border-acid-green transition-colors cursor-pointer"
          >
            <option value="">Filtrar por hora...</option>
            {hourOptions.map(h => (
              <option key={h} value={h}>Entrada {String(h).padStart(2, '0')}:00 - {String(h).padStart(2, '0')}:59</option>
            ))}
          </select>
          {hasFilters && (
            <button
              onClick={() => { setSearchPlaca(''); setSearchDate(''); setFilterHour(''); }}
              className="bg-lead hover:bg-gray-700 text-white px-3 transition-colors"
              title="Limpar filtros"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Lista */}
      {grouped.length === 0 ? (
        <div className="border border-dashed border-lead p-12 text-center text-gray-500 font-mono uppercase tracking-widest text-sm">
          {hasFilters ? 'Nenhum resultado encontrado.' : 'Nenhum recibo gerado ainda.'}
        </div>
      ) : (
        <div className="space-y-8">
          {grouped.map(([dateString, data]) => {
            const dateObj = parseISO(dateString);
            return (
              <div key={dateString} className="border border-lead bg-charcoal/50">
                <div className="bg-lead/50 px-6 py-4 flex items-center justify-between border-b border-lead">
                  <h2 className="text-base font-bold text-white capitalize">
                    {format(dateObj, "EEEE, dd 'de' MMMM yyyy", { locale: ptBR })}
                  </h2>
                  <div className="text-sm font-mono text-gray-400 uppercase tracking-widest">
                    {data.items.length} Veículos
                  </div>
                </div>

                <div className="p-6">
                  <div className="space-y-3">
                    {data.items.map(receipt => (
                      <ReceiptRow key={receipt.id} receipt={receipt} onPrint={r => setPrintReceipt(r)} />
                    ))}
                  </div>

                  <div className="mt-6 pt-6 border-t border-lead flex justify-between items-center">
                    <span className="text-sm uppercase tracking-widest text-gray-400 font-mono">
                      {hasFilters ? 'Total Filtrado' : 'Faturamento do Dia'}
                    </span>
                    <span className="text-2xl font-bold text-white font-mono">
                      R$ {data.total.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
