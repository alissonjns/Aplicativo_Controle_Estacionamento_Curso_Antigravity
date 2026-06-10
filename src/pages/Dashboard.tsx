import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { format, differenceInMinutes, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Car } from 'lucide-react';
import type { Vehicle, Receipt, VehicleType } from '../types';

function ReceiptModal({ receipt, onClose }: { receipt: Receipt; onClose: () => void }) {
  if (!receipt) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div id="receipt-print-area" className="bg-charcoal border-2 border-acid-green p-8 max-w-sm w-full shadow-[0_0_30px_rgba(57,255,20,0.2)] relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-acid-green print-hide"></div>
        <h2 className="text-xl font-display font-bold text-white mb-6 text-center uppercase tracking-widest border-b border-lead pb-4">
          Recibo de Saída
        </h2>
        
        <div className="space-y-4 font-mono text-sm mb-8">
          <div className="flex justify-between">
            <span className="text-gray-400">Placa:</span>
            <span className="text-white font-bold text-lg">{receipt.placa}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Modelo:</span>
            <span className="text-white">{receipt.modelo || '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Entrada:</span>
            <span className="text-white">{format(new Date(receipt.entryTime), 'dd/MM/yyyy HH:mm')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Saída:</span>
            <span className="text-white">{format(new Date(receipt.exitTime), 'dd/MM/yyyy HH:mm')}</span>
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
            className="flex-1 bg-acid-green hover:bg-neon-yellow text-black font-bold uppercase tracking-widest py-4 transition-colors text-xs"
          >
            Imprimir
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

function VehicleItem({ v, now, hourlyRate, handleCheckout }: { v: Vehicle, now: Date, hourlyRate: number, handleCheckout: (id: string, exitTimeStr: string, cost: number, duration: number) => void }) {
  const [exitTimeInput, setExitTimeInput] = useState('');
  const entryDate = new Date(v.entryTime);
  
  const calculateCost = () => {
    let exitDate = now;
    if (exitTimeInput) {
      exitDate = parse(exitTimeInput, 'HH:mm', now);
      // Handle overnight tracking simply by comparing, if exit is before entry, assume next day
      if (exitDate < entryDate) {
        exitDate.setDate(exitDate.getDate() + 1);
      }
    }
    
    const duration = Math.max(1, differenceInMinutes(exitDate, entryDate));
    
    // Regra: Primeira hora inteira, depois fracionado a cada 15 minutos
    let cost = hourlyRate;
    if (duration > 60) {
      const extraMinutes = duration - 60;
      const fractionBlocks = Math.ceil(extraMinutes / 15);
      cost = hourlyRate + (hourlyRate / 4) * fractionBlocks;
    }

    return { duration, cost, exitDate };
  };

  const { duration, cost, exitDate } = calculateCost();

  return (
    <div className="bg-pitch-black border border-lead p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-gray-600 transition-colors group">
      <div>
        <div className="text-xl font-display font-bold text-white tracking-widest">
          {v.placa}
        </div>
        <div className="text-sm text-gray-400 uppercase font-mono mt-1">
          {v.type || 'CARRO'} <span className="text-gray-600 px-1">•</span> {v.modelo || 'Sem modelo'}
        </div>
      </div>
      
      <div className="flex flex-wrap items-center gap-4 mt-2 sm:mt-0">
        <div className="text-right">
          <div className="text-[10px] text-gray-500 font-mono uppercase">Entrada</div>
          <div className="text-white font-mono">{format(entryDate, 'HH:mm')}</div>
        </div>
        
        <div className="text-right">
          <div className="text-[10px] text-acid-green font-mono uppercase">Saída</div>
          <input 
            type="time" 
            value={exitTimeInput}
            onChange={(e) => setExitTimeInput(e.target.value)}
            className="bg-charcoal border border-lead text-white px-2 py-1 h-[28px] focus:outline-none focus:border-acid-green font-mono w-24"
          />
        </div>

        <div className="text-right w-20">
          <div className="text-[10px] text-gray-500 font-mono uppercase">Valor</div>
          <div className="text-white font-mono font-bold">
            R$ {cost.toFixed(2).replace('.', ',')}
          </div>
        </div>

        <button
          onClick={() => handleCheckout(v.id, exitDate.toISOString(), cost, duration)}
          className="bg-acid-green hover:bg-neon-yellow text-black px-4 py-2 font-bold uppercase tracking-widest text-xs transition-colors"
        >
          Fechar
        </button>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { rates, setRates, vehicles, addVehicle, checkoutVehicle } = useStore();
  const safeRates = rates || { carro: 5, moto: 3, caminhonete: 6 };
  const [ratesInput, setRatesInput] = useState({ 
    carro: safeRates.carro.toString(), 
    moto: safeRates.moto.toString(), 
    caminhonete: safeRates.caminhonete.toString() 
  });
  const [placa, setPlaca] = useState('');
  const [modelo, setModelo] = useState('');
  const [typeInput, setTypeInput] = useState<VehicleType>('carro');
  const [now, setNow] = useState(new Date());
  const [activeReceipt, setActiveReceipt] = useState<Receipt | null>(null);
  
  const TOTAL_SPOTS = 20;
  const availableSpots = TOTAL_SPOTS - vehicles.length;

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleUpdateRates = () => {
    const carro = parseFloat(ratesInput.carro) || safeRates.carro;
    const moto = parseFloat(ratesInput.moto) || safeRates.moto;
    const caminhonete = parseFloat(ratesInput.caminhonete) || safeRates.caminhonete;
    setRates({ carro, moto, caminhonete });
  };

  const handleAddVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    if (placa && availableSpots > 0) {
      addVehicle({
        placa: placa.toUpperCase(),
        modelo,
        type: typeInput,
        entryTime: new Date().toISOString()
      });
      setPlaca('');
      setModelo('');
    }
  };

  const handleCheckout = (id: string, exitTime: string, cost: number, duration: number) => {
    if (window.confirm(`Gerar recibo de saída?\nTempo: ${duration} min\nValor: R$ ${cost.toFixed(2).replace('.', ',')}`)) {
      const receipt = checkoutVehicle(id, exitTime, cost, duration);
      if (receipt) {
        setActiveReceipt(receipt);
      }
    }
  };

  return (
    <div className="p-4 md:p-8 relative min-h-[calc(100vh-4rem)] overflow-hidden print:overflow-visible">
      {activeReceipt && (
        <ReceiptModal receipt={activeReceipt} onClose={() => setActiveReceipt(null)} />
      )}

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10 print-hide">
        
        {/* Left Column: Operation Panel */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-charcoal border border-lead p-6 relative">
            <div className="absolute top-0 left-0 w-1 h-full bg-acid-green"></div>
            <h2 className="text-sm font-mono uppercase tracking-widest text-gray-400 mb-4">Configuração</h2>
            
            <div className="space-y-3">
              <div className="flex gap-2 items-center">
                <span className="w-24 text-gray-400 font-mono text-xs uppercase">Carro</span>
                <input type="number" step="0.01" value={ratesInput.carro} onChange={e => setRatesInput({...ratesInput, carro: e.target.value})} className="w-full bg-pitch-black border border-lead text-white px-2 py-2 focus:border-acid-green outline-none" />
              </div>
              <div className="flex gap-2 items-center">
                <span className="w-24 text-gray-400 font-mono text-xs uppercase">Moto</span>
                <input type="number" step="0.01" value={ratesInput.moto} onChange={e => setRatesInput({...ratesInput, moto: e.target.value})} className="w-full bg-pitch-black border border-lead text-white px-2 py-2 focus:border-acid-green outline-none" />
              </div>
              <div className="flex gap-2 items-center">
                <span className="w-24 text-gray-400 font-mono text-xs uppercase">Caminh.</span>
                <input type="number" step="0.01" value={ratesInput.caminhonete} onChange={e => setRatesInput({...ratesInput, caminhonete: e.target.value})} className="w-full bg-pitch-black border border-lead text-white px-2 py-2 focus:border-acid-green outline-none" />
              </div>
              <button 
                onClick={handleUpdateRates}
                className="w-full mt-2 bg-lead hover:bg-gray-700 text-white py-3 font-mono uppercase text-xs transition-colors"
              >
                Atualizar Valores
              </button>
            </div>
          </div>

          <div className="bg-charcoal border border-lead p-6 relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-white"></div>
            <h2 className="text-sm font-mono uppercase tracking-widest text-gray-400 mb-4">Nova Entrada</h2>
            
            <div className="mb-6 border-b border-lead pb-4">
              <div className="text-3xl font-display font-bold text-white tracking-tighter">
                {format(now, 'HH:mm:ss')}
              </div>
              <div className="text-sm text-gray-500 font-mono">
                {format(now, "dd 'de' MMMM, yyyy", { locale: ptBR })}
              </div>
            </div>

            <form onSubmit={handleAddVehicle} className="space-y-4">
              <div>
                <label className="text-xs uppercase tracking-widest text-gray-400 font-mono block mb-1">Placa *</label>
                <input
                  type="text"
                  required
                  value={placa}
                  onChange={(e) => setPlaca(e.target.value)}
                  className="w-full bg-pitch-black border border-lead text-white px-4 py-3 focus:outline-none focus:border-acid-green transition-colors uppercase"
                  placeholder="ABC-1234"
                  maxLength={8}
                  disabled={availableSpots === 0}
                />
              </div>
              
              <div>
                <label className="text-xs uppercase tracking-widest text-gray-400 font-mono block mb-1">Modelo (Opcional)</label>
                <input
                  type="text"
                  value={modelo}
                  onChange={(e) => setModelo(e.target.value)}
                  className="w-full bg-pitch-black border border-lead text-white px-4 py-3 focus:outline-none focus:border-acid-green transition-colors"
                  placeholder="Ex: Honda Civic Preto"
                  disabled={availableSpots === 0}
                />
              </div>

              <div>
                <label className="text-xs uppercase tracking-widest text-gray-400 font-mono block mb-1">Tipo de Veículo *</label>
                <select 
                  value={typeInput} 
                  onChange={(e) => setTypeInput(e.target.value as VehicleType)} 
                  className="w-full bg-pitch-black border border-lead text-white px-4 py-3 focus:outline-none focus:border-acid-green transition-colors uppercase cursor-pointer"
                  disabled={availableSpots === 0}
                >
                  <option value="carro">Carro (R$ {safeRates.carro.toFixed(2).replace('.', ',')}/h)</option>
                  <option value="moto">Moto (R$ {safeRates.moto.toFixed(2).replace('.', ',')}/h)</option>
                  <option value="caminhonete">Caminhonete (R$ {safeRates.caminhonete.toFixed(2).replace('.', ',')}/h)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={availableSpots === 0}
                className="w-full bg-white hover:bg-gray-200 text-black font-bold uppercase tracking-widest py-4 px-4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Registrar Entrada
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Active Vehicles */}
        <div className="lg:col-span-8">
          <div className="flex items-center justify-between mb-6 border-b border-lead pb-2">
            <h2 className="text-sm font-mono uppercase tracking-widest text-gray-400 flex items-center gap-2">
              <Car size={16} /> Veículos no Pátio ({vehicles.length})
            </h2>
            <div className="text-xs font-mono uppercase tracking-widest text-acid-green bg-acid-green/10 px-3 py-1 border border-acid-green/20">
              Vagas Livres: {availableSpots} / {TOTAL_SPOTS}
            </div>
          </div>

          {vehicles.length === 0 ? (
            <div className="border border-dashed border-lead p-12 flex items-center justify-center text-gray-500 font-mono uppercase tracking-widest text-sm">
              Nenhum veículo estacionado
            </div>
          ) : (
            <div className="grid gap-4">
              {vehicles.map((v) => {
                const safeType = v.type || 'carro';
                return (
                  <VehicleItem 
                    key={v.id} 
                    v={v} 
                    now={now} 
                    hourlyRate={safeRates[safeType]} 
                    handleCheckout={handleCheckout} 
                  />
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
