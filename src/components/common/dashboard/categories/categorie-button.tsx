

interface CategorieButtonProps {
  name: string;
  icon: React.ReactNode;
}

export function CategorieButton({ name, icon}: CategorieButtonProps){
  return (
    <div className="text-[#FFAAA5] flex flex-col items-center gap-1 w-20">
      <div className="bg-[#FADADD] p-4 rounded-lg">{icon}</div>
      <span className="font-normal text-sm text-zinc-700 dark:text-zinc-300 text-wrap text-center">{name}</span>
    </div>
  )
}