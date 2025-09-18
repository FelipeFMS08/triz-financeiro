

interface FeedbackPopupProps {
  entrances: number;
  exits: number;
}

export function FeedbackPopup({ entrances, exits}: FeedbackPopupProps) {
  
  function percentage(entrances: number, exits: number) {
    return (exits / entrances ) * 100;
  }

  const balance = percentage(entrances, exits);
  if (entrances === 0 && exits === 0) {
    return null;
  } else if (balance < 50) {
    return (
      <div className="bg-[#A8E6CF] text-[white] text-center font-semibold px-4 py-3 rounded-lg relative" role="alert">
        <span className="block sm:inline"> Princesa! Você está gerenciando suas finanças de forma eficaz.</span>
      </div>
    );
  } else if (balance < 75) {
    return (
      <div className="bg-[#FADADD] text-zinc-700 text-center font-semibold px-4 py-3 rounded-lg relative" role="alert">
        <span className="block sm:inline"> Cuidado docinho. Você está próximo do limite.</span>
      </div>
    );
  } else if (balance < 99) {
    return (
      <div className="bg-[#FFAAA5] font-semibold text-white px-4 py-3 rounded-lg relative text-center" role="alert">
        <span className="block sm:inline"> Seus gastos estão um pouco altos. <br /> Hora de economizar minha fia.</span>
      </div>
    );
  } else {
    return (
      <div className="bg-[#333] font-semibold text-white px-4 py-3 rounded-lg relative text-center" role="alert">
        <span className="block sm:inline"> Você gastou mais do que entrou. <br /> Ta ferrada doçura.</span>
      </div>
    );
  }
}