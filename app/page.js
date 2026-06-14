"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Home() {
  const [userName, setUserName] = useState('');

  useEffect(() => {
    // Attempt to load user name from local storage
    const storedName = localStorage.getItem('flashcardUserName');
    if (storedName) {
      setUserName(storedName);
    }
  }, []);

  const handleNameChange = (event) => {
    const newName = event.target.value;
    setUserName(newName);
    localStorage.setItem('flashcardUserName', newName); // Save to local storage
  };

  return (
    <div className="main-content">
      <h1 className="text-center" style={{ fontSize: '3rem', marginBottom: '1.5rem', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        Welcome to Digital Flashcard Learner{userName ? `, ${userName}` : ''}!
      </h1>
      <p style={{ fontSize: '1.3rem', maxWidth: '800px', marginBottom: '2.5rem' }}>
        Tired of traditional flashcards? Our app offers a dynamic, personalized, and clutter-free way to master new material using custom sets and spaced repetition.
      </p>

      <div className="glass-card" style={{ maxWidth: '500px', width: '100%', padding: '2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Get Started</h2>
        <input
          type="text"
          placeholder="Enter your name to personalize your experience"
          value={userName}
          onChange={handleNameChange}
          style={{ width: '100%', marginBottom: '1rem' }}
        />
        <Link href="/my-sets" className="button">
          Create/Manage My Sets
        </Link>
        <Link href="/study-session" className="button button-secondary">
          Start Studying Now
        </Link>
      </div>

      <p style={{ fontSize: '1.1rem', marginTop: '3rem', maxWidth: '700px', opacity: 0.8 }}>
        "The mind is not a vessel to be filled, but a fire to be kindled." - Plutarch
      </p>
    </div>
  );
}
