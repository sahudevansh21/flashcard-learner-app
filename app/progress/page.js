"use client";

import { useState, useEffect } from 'react';

export default function ProgressPage() {
  const [sets, setSets] = useState([]);
  const [progressData, setProgressData] = useState({});

  useEffect(() => {
    // Load sets to get their names
    const storedSets = localStorage.getItem('flashcardSets');
    if (storedSets) {
      setSets(JSON.parse(storedSets));
    }

    // Load progress data
    const storedProgress = localStorage.getItem('flashcardProgress');
    if (storedProgress) {
      setProgressData(JSON.parse(storedProgress));
    }
  }, []);

  const calculateOverallProgress = () => {
    let totalCorrect = 0;
    let totalIncorrect = 0;
    let sessionsCompleted = 0;

    Object.values(progressData).forEach(data => {
      totalCorrect += data.totalCorrect;
      totalIncorrect += data.totalIncorrect;
      sessionsCompleted += data.sessionsCompleted;
    });

    const totalAnswers = totalCorrect + totalIncorrect;
    const accuracy = totalAnswers > 0 ? (totalCorrect / totalAnswers) * 100 : 0;

    return { totalCorrect, totalIncorrect, sessionsCompleted, accuracy };
  };

  const overall = calculateOverallProgress();

  return (
    <div className="flex-column items-center justify-center p-6 gap-6">
      <h1 className="text-center" style={{ fontSize: '2.5rem', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '1rem' }}>
        Your Learning Progress
      </h1>

      <div className="glass-card" style={{ maxWidth: '800px', width: '100%', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.8rem', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '1rem' }}>
          Overall Performance
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem' }}>
          <div className="stat-card glass-card" style={{backgroundColor: 'rgba(255,255,255,0.05)'}}>
            <h3>Total Sessions</h3>
            <p><span>{overall.sessionsCompleted}</span></p>
          </div>
          <div className="stat-card glass-card" style={{backgroundColor: 'rgba(255,255,255,0.05)'}}>
            <h3>Total Correct</h3>
            <p><span>{overall.totalCorrect}</span></p>
          </div>
          <div className="stat-card glass-card" style={{backgroundColor: 'rgba(255,255,255,0.05)'}}>
            <h3>Total Incorrect</h3>
            <p><span>{overall.totalIncorrect}</span></p>
          </div>
          <div className="stat-card glass-card" style={{backgroundColor: 'rgba(255,255,255,0.05)'}}>
            <h3>Accuracy</h3>
            <p><span>{overall.accuracy.toFixed(1)}%</span></p>
          </div>
        </div>
      </div>

      <h2 style={{ fontSize: '1.8rem', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '1rem' }}>
        Progress Per Set
      </h2>

      <div className="progress-grid">
        {sets.length === 0 && Object.keys(progressData).length === 0 ? (
          <p className="glass-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem' }}>
            No study sessions completed yet. Start studying to see your progress!
          </p>
        ) : (
          sets.map(set => {
            const setProgress = progressData[set.id] || { totalCorrect: 0, totalIncorrect: 0, sessionsCompleted: 0 };
            const totalAnswers = setProgress.totalCorrect + setProgress.totalIncorrect;
            const accuracy = totalAnswers > 0 ? (setProgress.totalCorrect / totalAnswers) * 100 : 0;

            return (
              <div key={set.id} className="glass-card stat-card flex-column">
                <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '0.8rem' }}>
                  {set.name}
                </h3>
                <p>Sessions: <span>{setProgress.sessionsCompleted}</span></p>
                <p>Correct: <span>{setProgress.totalCorrect}</span></p>
                <p>Incorrect: <span>{setProgress.totalIncorrect}</span></p>
                <p>Accuracy: <span style={{ color: accuracy >= 70 ? '#50cd50' : accuracy >= 40 ? '#f0ad4e' : '#ff6347' }}>{accuracy.toFixed(1)}%</span></p>
              </div>
            );
          })
        )}
        {sets.length > 0 && Object.keys(progressData).length === 0 && (
            <p className="glass-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem' }}>
                You have sets, but no study sessions have been completed yet.
            </p>
        )}
      </div>
    </div>
  );
}
