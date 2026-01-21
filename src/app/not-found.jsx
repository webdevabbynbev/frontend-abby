import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 px-6 text-center">
      
      {/* Logo / Favicon */}
      <img
        src="/favicon.svg"
        alt="Logo"
        className="mb-3 h-36 w-36"
      />

      {/* Error Code */}
      <h1 className="text-3xl font-bold tracking-tight text-primary-700 sm:text-5xl">
        404
      </h1>

      {/* Message */}
      <p className="mt-4 max-w-md text-lg text-primary-600">
        Oops! Halaman yang kamu cari tidak ditemukan atau sudah dipindahkan.
      </p>

      {/* Actions */}
      <div className="mt-8 flex gap-4">
        <Link
          href="/"
          className="rounded-full bg-primary-700 px-6 py-3 text-sm font-medium text-white transition hover:bg-primary-800"
        >
          Kembali ke Beranda
        </Link>
      </div>

      {/* Footer */}
      <p className="mt-12 text-sm text-slate-400">
        Jika ini kesalahan, silakan hubungi admin.
      </p>
    </div>
  )
}
