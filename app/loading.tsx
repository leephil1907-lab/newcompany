export default function Loading() {
  return <div className="min-h-[70vh] animate-pulse bg-[#f7f8f5]">
    <div className="bg-[#153b1d] px-6 py-24"><div className="container"><div className="h-3 w-40 rounded-full bg-white/20"/><div className="mt-7 h-12 max-w-2xl rounded-xl bg-white/15"/><div className="mt-3 h-12 max-w-xl rounded-xl bg-white/15"/><div className="mt-7 h-4 max-w-lg rounded-full bg-white/15"/></div></div>
    <div className="container grid gap-5 py-16 sm:grid-cols-2 lg:grid-cols-3">{[1,2,3,4,5,6].map(item=><div key={item} className="rounded-3xl border border-[#e5eae2] bg-white p-7"><div className="h-12 w-12 rounded-2xl bg-[#eaf1e6]"/><div className="mt-6 h-5 w-3/4 rounded-full bg-[#edf1eb]"/><div className="mt-4 h-3 w-full rounded-full bg-[#f0f2ee]"/><div className="mt-2 h-3 w-5/6 rounded-full bg-[#f0f2ee]"/></div>)}</div>
  </div>;
}
