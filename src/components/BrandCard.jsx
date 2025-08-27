export default function BrandCard({ Image }) {
  return (
    <div className="bg-white p-4 border rounded-lg w-auto h-auto max-w-[158px]">
      <img src={Image} alt="brand" className="w-auto h-auto object-contain" />
    </div>
  );
}