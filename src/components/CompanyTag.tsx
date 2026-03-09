const companyColors: Record<string, string> = {
  Google: 'border-blue-500/30 text-blue-400',
  Meta: 'border-accent-blue/30 text-accent-blue',
  Amazon: 'border-accent-orange/30 text-accent-orange',
  Microsoft: 'border-green-500/30 text-green-400',
  Apple: 'border-gray-400/30 text-gray-400',
  Netflix: 'border-red-500/30 text-red-400',
  Uber: 'border-gray-300/30 text-gray-300',
  Airbnb: 'border-pink-500/30 text-pink-400',
  Shopify: 'border-green-400/30 text-green-400',
  Vercel: 'border-white/30 text-white',
  Salesforce: 'border-cyan-400/30 text-cyan-400',
};

const defaultColor = 'border-text-muted/30 text-text-muted';

export function CompanyTag({ company }: { company: string }) {
  const color = companyColors[company] || defaultColor;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-medium ${color}`}
    >
      {company}
    </span>
  );
}
