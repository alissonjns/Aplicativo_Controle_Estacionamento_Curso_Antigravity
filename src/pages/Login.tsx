import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { KeyRound, Mail } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const login = useStore(state => state.login);
  const register = useStore(state => state.register);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (email && password) {
      if (isRegistering) {
        const success = register(email, password);
        if (success) {
          setIsRegistering(false);
          setPassword('');
          setError('');
          alert('Conta criada com sucesso! Faça login para entrar.');
        } else {
          setError('Usuário já existe!');
        }
      } else {
        const success = login(email, password);
        if (success) {
          navigate('/');
        } else {
          setError('Credenciais inválidas!');
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-pitch-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative brutalist background elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
        <div className="absolute top-[10%] left-[5%] text-[20vw] font-display font-bold leading-none text-lead select-none">
          SYS
        </div>
        <div className="absolute bottom-[5%] right-[5%] text-[20vw] font-display font-bold leading-none text-lead select-none">
          01
        </div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="border border-lead bg-charcoal/80 backdrop-blur-xl p-8 shadow-2xl relative">
          {/* Brutalist accents */}
          <div className="absolute top-0 left-0 w-2 h-2 bg-acid-green"></div>
          <div className="absolute bottom-0 right-0 w-2 h-2 bg-acid-green"></div>

          <h1 className="text-4xl font-display font-bold text-white mb-2 uppercase tracking-tight">
            Acesso
          </h1>
          <p className="text-gray-400 mb-8 font-mono text-sm uppercase tracking-widest border-b border-lead pb-4">
            Controle de Estacionamento
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-gray-400 font-mono">E-mail</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-pitch-black border border-lead text-white px-4 py-3 pl-10 focus:outline-none focus:border-acid-green focus:ring-1 focus:ring-acid-green transition-all"
                  placeholder="operador@estacionamento.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-gray-400 font-mono">Senha</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <KeyRound size={16} />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-pitch-black border border-lead text-white px-4 py-3 pl-10 focus:outline-none focus:border-acid-green focus:ring-1 focus:ring-acid-green transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500 text-red-500 text-xs p-3 font-mono uppercase">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-acid-green hover:bg-neon-yellow text-black font-bold uppercase tracking-widest py-4 px-4 transition-colors relative overflow-hidden group"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isRegistering ? 'Criar Conta' : 'Entrar no Sistema'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
              className="w-full text-center text-xs text-gray-400 hover:text-white mt-4 font-mono transition-colors uppercase"
            >
              {isRegistering ? 'Já tem conta? Fazer login' : 'Não tem conta? Cadastrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
