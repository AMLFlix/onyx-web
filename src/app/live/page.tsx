import { LiveMatchCard } from '../../components/LiveMatchCard';
import Link from 'next/link';

async function getAllLiveMatches() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const secretKey = process.env.APP_SECRET_KEY;
  if (!baseUrl || !secretKey) return [];

  const headers = { 'X-App-Key': secretKey, 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0)', 'Accept': 'application/json' };

  try {
    const res = await fetch(`${baseUrl}api/v1/matches?date=1`, { headers, next: { revalidate: 30 } });
    if (!res.ok) return [];
    const json = await res.json();
    const data = json.data || [];

    // 🟢 နောက်မှတင်ထားသော Data များ ရှေ့ဆုံးရောက်စေရန် .reverse() ကို အသုံးပြုထားပါသည်
    return Array.isArray(data) ? [...data].reverse() : [];
  } catch (error) {
    return [];
  }
}

export default async function LiveMatchesPage() {
  const matches = await getAllLiveMatches();

  return (
    <main className="min-h-screen bg-[#000000] text-white w-full overflow-x-hidden font-sans pb-16">
      <div className="flex items-center px-4 md:px-12 py-4 border-b border-white/5 sticky top-0 bg-[#111]/90 backdrop-blur-md z-50">
        {/* Back Button အတွက် Internal Link ကို ချန်ထားပါသည် */}
        <Link href="/" className="flex items-center text-xs font-semibold text-gray-300 hover:text-white transition-colors mr-4">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Back
        </Link>
        <h1 className="text-base md:text-lg font-black tracking-wider">
          LIVE <span className="text-white/50 font-medium text-xs md:text-sm">MATCHES</span>
        </h1>
      </div>

      <div className="w-full px-4 md:px-12 py-8 max-w-[1400px] mx-auto">
        {matches.length === 0 ? (
          <div className="text-center py-20 text-gray-500 bg-[#111] rounded-2xl border border-white/5">
            လက်ရှိ Live လွှင့်နေသော ပွဲစဉ်များ မရှိသေးပါ။
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {matches.map((match: any) => (
              /* 🔴 ဤနေရာတွင် <a> tag ဖြင့် ဒုတိယ Domain သို့ လွှဲပြောင်းပေးထားပါသည် */
              <a 
                key={match.match_id} 
                href={`https://onyx-stream-mu.vercel.app/match/${match.match_id}`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="block w-full transition-transform hover:-translate-y-1"
              >
                <div className="w-full h-full [&>div]:w-full">
                  <LiveMatchCard match={match} />
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}