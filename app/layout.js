import "./globals.css";
import Link from 'next/link';

export const metadata = {
  title: "Digital Flashcard Learner",
  description: "Create, study, and master material with personalized digital flashcards.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <nav className="navbar">
          <Link href="/" className="navbar-logo">
            Flashcard Learner
          </Link>
          <div className="nav-links">
            <Link href="/" className="nav-link">Home</Link>
            <Link href="/my-sets" className="nav-link">My Sets</Link>
            <Link href="/study-session" className="nav-link">Study Session</Link>
            <Link href="/progress" className="nav-link">Progress</Link>
          </div>
        </nav>
        <main className="container">
          {children}
        </main>
      </body>
    </html>
  );
}
