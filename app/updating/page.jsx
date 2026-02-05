import Link from "next/link"

export const metadata = {
  title: "Updating",
}

export default function UpdatingPage() {
  return (
    <main className="updating-page">
      <div className="updating-card">
        <h1 className="updating-title">Updating</h1>

        <p className="updating-text">
          This site is currently being updated.
          <br />
          Please check back soon.
        </p>

        <div className="updating-divider" />

        <Link href="/" className="updating-back">
          Go back
        </Link>
      </div>
    </main>
  )
}
