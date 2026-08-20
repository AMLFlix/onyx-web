import { HighlightCard } from '../../components/HighlightCard';
import Link from 'next/link';

async function getAllHighlights() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const secretKey = process.env.APP_SECRET_KEY;
  if (!baseUrl || !secretKey) return [];

  const headers = { 'X-App-Key': secretKey, 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0)', 'Accept': 'application/json' };

  try {
    const res = await fetch(`${baseUrl}api/v1/highlights`, { headers, next: { revalidate: 60 } });
    if (!res.ok) return [];
    const json = await res.json();
    const data = json.data || [];

    // 🟢 နောက်မှတင်ထားသော Data များ ရှေ့ဆုံးရောက်စေရန် .reverse() ကို အသုံးပြုထားပါသည်
    return Array.isArray(data) ? [...data].reverse() : [];
  } catch (error) {
    return [];
  }
}

export default async function HighlightsPage() {
  const highlights = await getAllHighlights();

  return (
    <main className="min-h-screen bg-[#000000] text-white w-full overflow-x-hidden">
      <div className="flex items-center px-4 md:px-8 py-4 border-b border-white/5 sticky top-0 bg-black/90 backdrop-blur-md z-10">
        {/* Back Button အတွက် Internal Link ကို ချန်ထားပါသည် */}
        <Link href="/" className="text-white hover:bg-white/10 p-2 rounded-full mr-3 transition-colors">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </Link>
        <h1 className="text-lg md:text-xl font-black tracking-wider">
          HIGHLIGHTS <span className="text-white/50 font-medium text-sm md:text-base">& VODs</span>
        </h1>
      </div>

      <div className="p-4 md:p-8 w-full">
        {highlights.length === 0 ? (
          <div className="text-center py-20 text-gray-500 bg-[#111] rounded-2xl border border-white/5">
            VOD များ မရှိသေးပါ။
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-6">
            {highlights.map((match: any) => (
              /* 🔴 ဤနေရာတွင် <a> tag ဖြင့် ဒုတိယ Domain သို့ လွှဲပြောင်းပေးထားပါသည် */
              <a 
                key={match.match_id} 
                href={`https://onyx-stream-mu.vercel.app/match/${match.match_id}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="block h-full transition-transform hover:scale-[1.02]"
              >
                <HighlightCard match={match} />
              </a>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}