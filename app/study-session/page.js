"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

// Simple Spaced Repetition Logic (dummy implementation)
// nextInterval: The number of days until the card should be shown again
// factor: Represents the ease of the card (higher = easier)
const getNextInterval = (currentInterval, factor, performance) => {
  if (performance === 'hard') {
    return 1; // Show again very soon
  } else if (performance === 'good') {
    return Math.max(1, Math.round(currentInterval * factor));
  } else if (performance === 'easy') {
    return Math.max(1, Math.round(currentInterval * factor * 1.5)); // Even longer
  }
  return 0; // Should not happen
};

export default function StudySessionPage() {
  const [sets, setSets] = useState([]);
  const [selectedSetId, setSelectedSetId] = useState('');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [shuffledCards, setShuffledCards] = useState([]);
  const [showAnswer, setShowAnswer] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionFinished, setSessionFinished] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);

  useEffect(() => {
    const storedSets = localStorage.getItem('flashcardSets');
    if (storedSets) {
      setSets(JSON.parse(storedSets));
    }
  }, []);

  // Fisher-Yates shuffle algorithm
  const shuffleArray = (array) => {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
    return array;
  };

  const startSession = () => {
    const selectedSet = sets.find(set => set.id === selectedSetId);
    if (selectedSet && selectedSet.cards.length > 0) {
      const initialCards = selectedSet.cards.map(card => ({
        ...card,
        interval: 0, // days until next review
        easeFactor: 2.5, // initial ease factor (default Anki value)
        repetitions: 0, // how many times successfully recalled
      }));
      setShuffledCards(shuffleArray([...initialCards]));
      setCurrentCardIndex(0);
      setShowAnswer(false);
      setSessionStarted(true);
      setSessionFinished(false);
      setCorrectCount(0);
      setIncorrectCount(0);
    } else {
      alert("Please select a set with cards to start studying!");
    }
  };

  const handleShowAnswer = () => {
    setShowAnswer(true);
  };

  const handleCardResult = (performance) => {
    const currentCard = shuffledCards[currentCardIndex];
    let updatedCard = { ...currentCard };

    if (performance === 'easy') {
      updatedCard.repetitions += 1;
      updatedCard.easeFactor = Math.min(2.5, currentCard.easeFactor + 0.15);
      updatedCard.interval = getNextInterval(currentCard.interval, updatedCard.easeFactor, 'easy');
      setCorrectCount(prev => prev + 1);
    } else if (performance === 'good') {
      updatedCard.repetitions += 1;
      updatedCard.interval = getNextInterval(currentCard.interval, currentCard.easeFactor, 'good');
      setCorrectCount(prev => prev + 1);
    } else { // 'hard'
      updatedCard.repetitions = 0; // Reset repetitions on hard
      updatedCard.easeFactor = Math.max(1.3, currentCard.easeFactor - 0.2);
      updatedCard.interval = getNextInterval(currentCard.interval, updatedCard.easeFactor, 'hard');
      setIncorrectCount(prev => prev + 1);
    }

    // Update the card in the shuffled list
    const updatedShuffledCards = [...shuffledCards];
    updatedShuffledCards[currentCardIndex] = updatedCard;

    // A basic spaced repetition re-queueing (cards marked 'hard' come back sooner)
    if (performance === 'hard') {
      const reinsertIndex = Math.min(currentCardIndex + Math.floor(shuffledCards.length / 3), shuffledCards.length - 1);
      updatedShuffledCards.splice(reinsertIndex, 0, updatedCard);
      updatedShuffledCards.splice(currentCardIndex, 1); // Remove the original card from its current spot
      setShuffledCards(updatedShuffledCards);
    } else {
      setShuffledCards(updatedShuffledCards);
    }


    // Move to next card
    if (currentCardIndex < shuffledCards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
      setShowAnswer(false);
    } else {
      setSessionFinished(true);
      setSessionStarted(false);
      // Here you would save progress to localStorage
      saveSessionProgress(selectedSetId, correctCount + (performance !== 'hard' ? 1 : 0), incorrectCount + (performance === 'hard' ? 1 : 0));
    }
  };

  const saveSessionProgress = (setId, finalCorrect, finalIncorrect) => {
    const progressData = JSON.parse(localStorage.getItem('flashcardProgress') || '{}');
    if (!progressData[setId]) {
      progressData[setId] = { totalCorrect: 0, totalIncorrect: 0, sessionsCompleted: 0 };
    }
    progressData[setId].totalCorrect += finalCorrect;
    progressData[setId].totalIncorrect += finalIncorrect;
    progressData[setId].sessionsCompleted += 1;
    localStorage.setItem('flashcardProgress', JSON.stringify(progressData));
  };


  const currentCard = shuffledCards[currentCardIndex];
  const progressPercentage = shuffledCards.length > 0 ? ((currentCardIndex + 1) / shuffledCards.length) * 100 : 0;

  return (
    <div className="flex-column items-center justify-center p-6 gap-6">
      <h1 className="text-center" style={{ fontSize: '2.5rem', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '1rem' }}>
        Study Session
      </h1>

      {!sessionStarted && !sessionFinished && (
        <div className="glass-card flex-column gap-4" style={{ maxWidth: '500px', width: '100%' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Select a Flashcard Set</h2>
          <select
            value={selectedSetId}
            onChange={(e) => setSelectedSetId(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--card-bg-dark)',
              color: 'var(--text-light)',
              borderRadius: '8px',
              fontSize: '1rem',
              appearance: 'none', // Remove default arrow
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23e0e0e0'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 0.75rem center',
              backgroundSize: '1.5em 1.5em',
            }}
          >
            <option value="">-- Choose a Set --</option>
            {sets.map(set => (
              <option key={set.id} value={set.id}>
                {set.name} ({set.cards.length} cards)
              </option>
            ))}
          </select>
          <button onClick={startSession} className="button" disabled={!selectedSetId || sets.find(set => set.id === selectedSetId)?.cards.length === 0}>
            Start Studying
          </button>
          <Link href="/my-sets" className="button button-secondary">
             Manage My Sets
          </Link>
        </div>
      )}

      {sessionStarted && currentCard && (
        <div className="flashcard-container glass-card">
          <p style={{ opacity: 0.7, marginBottom: '0.5rem' }}>Card {currentCardIndex + 1} of {shuffledCards.length}</p>
          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: `${progressPercentage}%` }}></div>
          </div>

          <div className="glass-card flashcard-content" style={{ width: '100%', minHeight: '180px' }}>
            {!showAnswer ? (
              <p>{currentCard.front}</p>
            ) : (
              <p className="revealed">{currentCard.back}</p>
            )}
          </div>

          <div className="flashcard-actions">
            {!showAnswer && (
              <button onClick={handleShowAnswer} className="button">
                Show Answer
              </button>
            )}
            {showAnswer && (
              <>
                <button onClick={() => handleCardResult('hard')} className="button button-secondary" style={{ backgroundColor: 'rgba(255, 99, 71, 0.2)', borderColor: 'rgba(255, 99, 71, 0.4)' }}>
                  Hard
                </button>
                <button onClick={() => handleCardResult('good')} className="button button-secondary" style={{ backgroundColor: 'rgba(120, 200, 255, 0.2)', borderColor: 'rgba(120, 200, 255, 0.4)' }}>
                  Good
                </button>
                <button onClick={() => handleCardResult('easy')} className="button button-secondary" style={{ backgroundColor: 'rgba(50, 205, 50, 0.2)', borderColor: 'rgba(50, 205, 50, 0.4)' }}>
                  Easy
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {sessionFinished && (
        <div className="glass-card flex-column gap-4" style={{ maxWidth: '500px', width: '100%' }}>
          <h2 style={{ fontSize: '1.8rem', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Session Complete!
          </h2>
          <p style={{ fontSize: '1.2rem' }}>You finished studying "{sets.find(set => set.id === selectedSetId)?.name}".</p>
          <p style={{ fontSize: '1.1rem' }}>Correct answers: <span style={{ color: '#50cd50', fontWeight: 'bold' }}>{correctCount}</span></p>
          <p style={{ fontSize: '1.1rem' }}>Incorrect answers: <span style={{ color: '#ff6347', fontWeight: 'bold' }}>{incorrectCount}</span></p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button onClick={() => setSessionFinished(false) & setSessionStarted(false) & setSelectedSetId('')} className="button button-secondary" style={{ flexGrow: 1 }}>
              Study Another Set
            </button>
            <Link href="/progress" className="button" style={{ flexGrow: 1 }}>
              View Progress
            </Link>
          </div>
        </div>
      )}

      {!sessionStarted && !sessionFinished && (selectedSetId && sets.find(set => set.id === selectedSetId)?.cards.length === 0) && (
        <p className="glass-card" style={{maxWidth: '500px', width: '100%', textAlign: 'center', color: '#ff6347', borderColor: 'rgba(255, 99, 71, 0.4)'}}>
          The selected set has no cards. Please add some cards on the "My Sets" page.
        </p>
      )}
    </div>
  );
}
