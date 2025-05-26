import CircleLarge from '../components/CircleLarge/CircleLarge'
import HalfCircleSidebar from '../components/HalfCircleSidebar/HalfCircleSidebar'

export default function Home() {
  return (
    <div className="pt-3 sm:pt-0 w-screen min-h-[100dvh] bg-gray-100 flex items-center justify-center relative">
      <HalfCircleSidebar />
      <CircleLarge />
    </div>
  );
}