import { useProfile } from "../features/auth/useProfile";

export function AccountSettingsPage() {
  const { profile } = useProfile();
  const isOwner = profile?.role === "owner";

  return (
    <div className="flex flex-col md:flex-row gap-8 mt-2">
      {/* Sidebar Navigation (Account Specific) */}
      <aside className="w-full md:w-64 flex-shrink-0">
        <div className="flex flex-col h-full p-6 bg-surface-container-low dark:bg-[#121212] rounded-xl">
          <div className="mb-8">
            <h2 className="text-xl font-black uppercase tracking-widest text-primary font-headline">The Game Haven</h2>
            <p className="text-sm text-on-surface-variant font-medium">Curated Board Gaming</p>
          </div>
          <nav className="space-y-2">
            <a className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-[#2e2f2d] text-primary dark:text-primary-fixed rounded-xl shadow-sm font-semibold transition-all duration-200" href="#">
              <span className="material-symbols-outlined shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>account_circle</span>
              <span>Profile</span>
            </a>
            <a className="flex items-center gap-3 px-4 py-3 text-on-surface dark:text-outline-variant hover:bg-surface-container-highest dark:hover:bg-[#2e2f2d] hover:pl-6 rounded-xl transition-all duration-200" href="#">
              <span className="material-symbols-outlined shrink-0">analytics</span>
              <span>Stats</span>
            </a>
            <a className="flex items-center gap-3 px-4 py-3 text-on-surface dark:text-outline-variant hover:bg-surface-container-highest dark:hover:bg-[#2e2f2d] hover:pl-6 rounded-xl transition-all duration-200" href="#">
              <span className="material-symbols-outlined shrink-0">link</span>
              <span>Connections</span>
            </a>
            <a className="flex items-center gap-3 px-4 py-3 text-on-surface dark:text-outline-variant hover:bg-surface-container-highest dark:hover:bg-[#2e2f2d] hover:pl-6 rounded-xl transition-all duration-200" href="#">
              <span className="material-symbols-outlined shrink-0">notifications</span>
              <span>Alerts</span>
            </a>
          </nav>

          <div className="mt-auto pt-8">
            <button className="w-full py-4 bg-gradient-to-br from-primary to-primary-container text-on-primary rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-primary/20 hover:scale-[0.98] active:scale-95 transition-all">
              <span className="material-symbols-outlined shrink-0">add</span>
              Add New Game
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <section className="flex-1 space-y-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.1em] text-primary">Account Dashboard</span>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-on-surface mt-2">
              Welcome back, {profile?.username ?? "Player"}.
            </h1>
          </div>
          <div className="flex gap-4">
            <div className="px-4 py-2 bg-secondary-fixed rounded-full flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-secondary"></span>
              <span className="text-on-secondary-container text-xs font-bold uppercase tracking-wider">
                {isOwner ? "Owner Mode" : "Player Mode"}
              </span>
            </div>
          </div>
        </div>

        {/* Bento Grid Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-4">
          <div className="md:col-span-2 md:row-span-2 bg-surface-container-lowest p-8 rounded-xl flex flex-col justify-between shadow-sm border border-outline-variant/10">
            <span className="material-symbols-outlined text-primary text-4xl mb-4">inventory_2</span>
            <div>
              <div className="text-6xl font-black text-on-surface tracking-tighter">142</div>
              <div className="text-lg font-medium text-on-surface-variant">Games in your collection</div>
            </div>
            <div className="pt-4 border-t border-surface-container mt-4">
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Your collection has grown by <span className="font-bold text-secondary">12%</span> this month. Most played genre: <span className="font-bold text-primary">Eurogames</span>.
              </p>
            </div>
          </div>
          
          <div className="md:col-span-1 bg-surface-container-low p-6 rounded-xl flex flex-col justify-center border border-outline-variant/5">
            <div className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">Wishlist</div>
            <div className="text-3xl font-black text-primary">28</div>
            <div className="mt-4 flex -space-x-2">
              <div className="w-8 h-8 rounded-full border-2 border-surface bg-surface-container-highest overflow-hidden">
                <img className="w-full h-full object-cover" alt="wishlist game 1" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBguiXq6FABe6DPf9lfiEPbCCTVBrIUg58ODeYu2KhPpnAGKOjjaOs5OdvQk9tlZF7I8lbGoPtnb-6tdk5dm2-O-sfmgMnUMZN3NBkhja_aW21qoXBdxntq3LfMuSzVI0s0tTx69sAcikesOS4j_Ap-pHP9VETfmFqiTQNGIgmJpAqa0ySiAs9UTwLGitG0cdCwVMbs_ET_j89w0Du_L30a2Myop_K134ZQTVsIBMkrXUhILhx_goZM3Mh4FrVeuMP0xGtCA9M5Ao4" />
              </div>
              <div className="w-8 h-8 rounded-full border-2 border-surface bg-surface-container-highest overflow-hidden">
                <img className="w-full h-full object-cover" alt="wishlist game 2" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBOu7gWVczr4EeMNrqtYpKe5CML7RFRzhtIEkf7XgOg7vxme3oUyn6LqrouxGmWQkJW7_EvN4GM1kFxCqLOAZnmo5sxOvOJLhNYn1P-qUw_mUPXvlEKmKdJ2wwNlbYpjGxANchh6j104-IgykehhEfKbRXWGJWLiSmBayPfldU69-YAyo5ln7Ha7Mp433J0rIGPvkhUYvxr8_g7sLN0lb9GY7eTk-FEW2eC3mhgxigSLp53lNIVypbZrOt2Mkk0EMl5bx0MiAZBi3Q" />
              </div>
              <div className="w-8 h-8 rounded-full border-2 border-surface bg-surface-container-highest flex items-center justify-center text-[10px] font-bold">+26</div>
            </div>
          </div>
          
          <div className="md:col-span-1 bg-surface-container-low p-6 rounded-xl flex flex-col justify-center border border-outline-variant/5">
            <div className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">Total Playtime</div>
            <div className="text-3xl font-black text-secondary">842h</div>
            <div className="mt-2 h-1 w-full bg-surface-container-highest rounded-full overflow-hidden">
              <div className="h-full bg-secondary w-3/4 rounded-full"></div>
            </div>
            <div className="text-[10px] mt-2 font-medium text-on-surface-variant">Top 5% of global players</div>
          </div>
          
          <div className="md:col-span-2 bg-surface-container-lowest p-6 rounded-xl flex items-center gap-6 shadow-sm border border-outline-variant/10">
            <div className="w-16 h-16 shrink-0 bg-surface-container-low rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl text-tertiary">workspace_premium</span>
            </div>
            <div>
              <div className="text-sm font-bold uppercase tracking-widest text-on-surface-variant">Achievement</div>
              <div className="text-xl font-bold text-on-surface">Master Strategist</div>
              <p className="text-sm text-on-surface-variant">Won 50+ games of heavy complexity</p>
            </div>
          </div>
        </div>

        {/* Preferences Section */}
        <div className="space-y-6">
          <h3 className="text-2xl font-bold tracking-tight border-b border-surface-container pb-4">Preferences &amp; Personalization</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="bg-surface-container-low p-6 rounded-xl flex items-center justify-between hover:bg-surface-container-high transition-colors group cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 shrink-0 rounded-xl bg-white flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-primary">dark_mode</span>
                </div>
                <div>
                  <h4 className="font-bold text-on-surface">Dark Mode</h4>
                  <p className="text-sm text-on-surface-variant">Switch to high-contrast night view</p>
                </div>
              </div>
              <button className="w-12 h-6 bg-surface-container-highest rounded-full relative p-1 flex items-center transition-colors shrink-0">
                <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
              </button>
            </div>
            
            <div className="bg-surface-container-low p-6 rounded-xl flex items-center justify-between hover:bg-surface-container-high transition-colors group cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 shrink-0 rounded-xl bg-white flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-primary">visibility</span>
                </div>
                <div>
                  <h4 className="font-bold text-on-surface">Public Profile</h4>
                  <p className="text-sm text-on-surface-variant">Allow others to see your collection</p>
                </div>
              </div>
              <button className="w-12 h-6 bg-primary rounded-full relative p-1 flex items-center justify-end transition-colors shrink-0">
                <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
              </button>
            </div>
            
            <div className="bg-surface-container-low p-6 rounded-xl flex items-center justify-between hover:bg-surface-container-high transition-colors group cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 shrink-0 rounded-xl bg-white flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-primary">notifications_active</span>
                </div>
                <div>
                  <h4 className="font-bold text-on-surface">Smart Alerts</h4>
                  <p className="text-sm text-on-surface-variant">Notify when wishlisted games go on sale</p>
                </div>
              </div>
              <button className="w-12 h-6 bg-primary rounded-full relative p-1 flex items-center justify-end transition-colors shrink-0">
                <div className="w-4 h-4 bg-white rounded-full shadow-sm"></div>
              </button>
            </div>
            
            <div className="bg-surface-container-low p-6 rounded-xl flex items-center justify-between hover:bg-surface-container-high transition-colors group cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 shrink-0 rounded-xl bg-white flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-primary">sync</span>
                </div>
                <div>
                  <h4 className="font-bold text-on-surface">BGG Sync</h4>
                  <p className="text-sm text-on-surface-variant">Last synced: 14 mins ago</p>
                </div>
              </div>
              <button className="text-xs font-bold uppercase tracking-widest text-primary hover:bg-primary/10 px-3 py-2 rounded-lg transition-colors shrink-0">Re-sync</button>
            </div>

          </div>
        </div>

        {/* Danger Zone */}
        <div className="pt-8 border-t border-surface-container">
          <div className="bg-error-container/10 p-6 md:p-8 rounded-xl border border-error-container/20 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold text-error">Account Deletion</h3>
              <p className="text-on-surface-variant mt-1 text-sm md:text-base">Permanently remove your collection data and profile history.</p>
            </div>
            <button className="px-6 py-3 bg-error text-on-error rounded-xl font-bold hover:bg-error-dim transition-colors shadow-lg shadow-error/20 shrink-0">
              Delete Account
            </button>
          </div>
        </div>

      </section>
    </div>
  );
}
