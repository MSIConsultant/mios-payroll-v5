import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="text-center">
        <h2 className="text-lg font-semibold">Not Found</h2>
        <p>Could not find requested resource</p>
        <Link href="/" className="text-blue-500 mt-4 block">Return Home</Link>
      </div>
    </div>
  );
}
