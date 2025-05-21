import CircleSmall from '../CircleSmall/CircleSmall';

export default function CircleLarge() {
  return (
    <div className="relative w-[680px] h-[680px] rounded-full border border-gray-700 shadow-md flex items-center justify-center">
      {/* Área central de notas */}
      <div className="text-center"></div>
      <CircleSmall />
    </div>
  );
}