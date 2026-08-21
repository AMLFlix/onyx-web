import { LiveMatchCard } from '../components/LiveMatchCard';
import { UpcomingSection } from '../components/UpcomingSection';
import { HighlightCard } from '../components/HighlightCard';
import { BannerAd } from '../components/BannerAd';
import { PLAYER_DOMAIN, APP_DOWNLOAD_URL } from '../lib/config';
import Link from 'next/link';

async function getHomePageData() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const secretKey = process.env.APP_SECRET_KEY;

  if (!baseUrl || !secretKey) return { live: [], upcoming: [], highlights: [], ads: [] };

  const headers = {
    'X-App-Key': secretKey,
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
    'Accept': 'application/json',
  };

  try {
    const [liveRes, upcomingRes, highlightsRes, adsRes] = await Promise.all([
      fetch(`${baseUrl}api/v1/matches?date=1`, { headers, next: { revalidate: 30 } }),
      fetch(`${baseUrl}api/v1/upcoming?page=1&limit=30`, { headers, next: { revalidate: 30 } }),
      fetch(`${baseUrl}api/v1/highlights`, { headers, next: { revalidate: 60 } }),
      fetch(`${baseUrl}api/v1/ads`, { headers, next: { revalidate: 60 } })
    ]);

    const [liveJson, upcomingJson, highlightsJson, adsJson] = await Promise.all([
      liveRes.ok ? liveRes.json() : { data: [] },
      upcomingRes.ok ? upcomingRes.json() : { data: [] },
      highlightsRes.ok ? highlightsRes.json() : { data: [] },
      adsRes.ok ? adsRes.json() : { data: [] }
    ]);

    return {
      live: Array.isArray(liveJson.data) ? liveJson.data.reverse() : [],
      upcoming: Array.isArray(upcomingJson.data) ? upcomingJson.data : [],
      highlights: Array.isArray(highlightsJson.data) ? highlightsJson.data.reverse() : [],
      ads: Array.isArray(adsJson.data) ? adsJson.data.reverse() : []
    };
  } catch (error) {
    return { live: [], upcoming: [], highlights: [], ads: [] };
  }
}

export default async function HomePage() {
  const { live, upcoming, highlights, ads } = await getHomePageData();

  const homeBanners = ads.filter((ad: any) => ad.position === 'home_banner' && ad.is_active === 1);

  return (
    <main className="min-h-screen bg-[#000000] text-white w-full overflow-x-hidden pb-10">
      
      {/* Header & Premium App Install Button */}
      <div className="flex justify-between items-center px-4 md:px-8 py-4 border-b border-white/5 bg-[#000000]/80 sticky top-0 z-50 backdrop-blur-xl">
        <h1 className="text-2xl font-black tracking-wider">
          ONY<span className="text-[#00E676]">X</span>
        </h1>
        
        <a 
          href={APP_DOWNLOAD_URL} 
          className="group flex items-center gap-2.5 bg-white/5 border border-white/10 hover:border-[#00E676]/40 px-2.5 py-1.5 rounded-xl transition-all duration-300 hover:bg-white/10 active:scale-95"
        >
          <div className="w-7 h-7 rounded-lg bg-black/50 group-hover:bg-[#00E676]/10 flex items-center justify-center transition-colors">
            <svg 
              width="14" 
              height="14" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="text-gray-400 group-hover:text-[#00E676] group-hover:-translate-y-0.5 transition-all duration-300"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          </div>
          <div className="flex flex-col pr-1">
            <span className="text-[9px] font-black text-[#00E676] uppercase tracking-wider leading-none mb-0.5">Free</span>
            <span className="text-xs font-bold text-gray-200 group-hover:text-white leading-none transition-colors">
              Install App
            </span>
          </div>
        </a>
      </div>

      {homeBanners.length > 0 && (
        <div className="px-4 md:px-8 mb-6 mt-4">
          <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none gap-4">
            {homeBanners.map((ad: any) => (
              <div key={ad.id} className="snap-center shrink-0 w-full md:w-[600px]">
                <BannerAd ad={ad} heightClass="h-[130px] md:h-[180px]"/>
              </div>
            ))}
          </div>
        </div>
      )}

      {live.length > 0 && (
        <section className="mb-6">
          <div className="flex justify-between items-center px-4 md:px-8 mb-3">
            <h2 className="text-base font-bold text-white">Live Matches</h2>
            <Link className="text-[11px] font-semibold text-[#00E676] cursor-pointer hover:underline" href="/live">
              See All
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto px-4 md:px-8 pb-4 scrollbar-none snap-x snap-mandatory">
            {live.map((match: any) => (
              <div key={match.match_id} className="snap-start shrink-0">
                {/* target="_blank" ကို ဖယ်ရှားထားသောကြောင့် Tab အသစ်မပွင့်တော့ပါ */}
                <a href={`${PLAYER_DOMAIN}/match/${match.match_id}`} className="block">
                  <LiveMatchCard match={match}/>
                </a>
              </div>
            ))}
          </div>
        </section>
      )}

      {upcoming.length > 0 && (
        <section className="mb-6">
          <div className="flex justify-between items-center px-4 md:px-8 mb-3">
            <h2 className="text-base font-bold text-white">Upcoming Matches</h2>
          </div>
          <UpcomingSection matches={upcoming}/>
        </section>
      )}

      {highlights.length > 0 && (
        <section className="mb-6">
          <div className="flex justify-between items-center px-4 md:px-8 mb-3">
            <h2 className="text-base font-bold text-white">Highlights & VODs</h2>
            <Link className="text-[11px] font-semibold text-[#00E676] cursor-pointer hover:underline" href="/highlights">
              See All
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto px-4 md:px-8 pb-4 scrollbar-none snap-x snap-mandatory">
            {highlights.map((match: any) => (
              <div key={match.match_id} className="snap-start shrink-0">
                {/* target="_blank" ကို ဖယ်ရှားထားသောကြောင့် Tab အသစ်မပွင့်တော့ပါ */}
                <a href={`${PLAYER_DOMAIN}/match/${match.match_id}`} className="block">
                  <HighlightCard match={match}/>
                </a>
              </div>
            ))}
          </div>
        </section>
      )}

    </main>
  );
}