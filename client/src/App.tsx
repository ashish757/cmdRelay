import { Provider } from './context/Provider';
import { useUI } from './context/UICtx';
import { ConnectionScreen } from './components/ConnectionScreen';
import { MenuOverlay } from './components/Menu';
import { ArrowKeysCtrl } from './components/ArrowKeysCtrl';

function MainInterface() {
  const { activeLayout, setIsMenuOpen } = useUI();

  return (
      <main className="h-screen w-screen bg-black flex flex-col overflow-hidden select-none touch-none text-white font-sans relative">
        <ConnectionScreen />
        <MenuOverlay />

        <button
            onClick={() => setIsMenuOpen(true)}
            className="absolute top-6 left-6 z-10 w-12 h-12 bg-neutral-800 rounded-full flex flex-col items-center justify-center gap-1.5 opacity-70 active:opacity-100"
        >
          <div className="w-5 h-0.5 bg-white"></div>
          <div className="w-5 h-0.5 bg-white"></div>
          <div className="w-5 h-0.5 bg-white"></div>
        </button>

        {activeLayout === 'arrowKeys' ? <ArrowKeysCtrl /> : null}
      </main>
  );
}

export default function App() {
  return (
      <Provider>
        <MainInterface />
      </Provider>
  );
}