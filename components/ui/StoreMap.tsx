export function StoreMap() {
  return (
    <div className="mt-6">
      <h3 className="text-sm font-semibold text-zinc-700">Google Maps thrift search</h3>
      <iframe
        className="mt-3 h-72 w-full rounded-xl border border-zinc-200"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        src="https://www.google.com/maps?q=thrift+store+near+me&output=embed"
        title="Thrift stores near me"
      />
    </div>
  );
}
