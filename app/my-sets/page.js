"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function MySetsPage() {
  const [sets, setSets] = useState([]);
  const [newSetName, setNewSetName] = useState('');
  const [newCardFront, setNewCardFront] = useState('');
  const [newCardBack, setNewCardBack] = useState('');
  const [editingSetId, setEditingSetId] = useState(null);
  const [showAddCardForm, setShowAddCardForm] = useState(false);

  useEffect(() => {
    // Load sets from local storage on component mount
    const storedSets = localStorage.getItem('flashcardSets');
    if (storedSets) {
      setSets(JSON.parse(storedSets));
    }
  }, []);

  useEffect(() => {
    // Save sets to local storage whenever they change
    localStorage.setItem('flashcardSets', JSON.stringify(sets));
  }, [sets]);

  const generateUniqueId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  const handleCreateSet = () => {
    if (newSetName.trim()) {
      const newSet = {
        id: generateUniqueId(),
        name: newSetName.trim(),
        cards: [],
      };
      setSets([...sets, newSet]);
      setNewSetName('');
    }
  };

  const handleDeleteSet = (setId) => {
    setSets(sets.filter(set => set.id !== setId));
    setEditingSetId(null); // Close editor if deleted set was being edited
  };

  const handleEditSet = (setId) => {
    setEditingSetId(setId);
    setShowAddCardForm(false); // Hide add card form when switching sets
  };

  const handleAddCard = (setId) => {
    if (newCardFront.trim() && newCardBack.trim()) {
      setSets(sets.map(set =>
        set.id === setId
          ? {
              ...set,
              cards: [...set.cards, { id: generateUniqueId(), front: newCardFront.trim(), back: newCardBack.trim() }]
            }
          : set
      ));
      setNewCardFront('');
      setNewCardBack('');
    }
  };

  const handleDeleteCard = (setId, cardId) => {
    setSets(sets.map(set =>
      set.id === setId
        ? {
            ...set,
            cards: set.cards.filter(card => card.id !== cardId)
          }
        : set
    ));
  };

  return (
    <div className="flex-column items-center justify-center p-6 gap-6">
      <h1 className="text-center" style={{ fontSize: '2.5rem', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '1rem' }}>
        My Flashcard Sets
      </h1>

      <div className="glass-card" style={{ maxWidth: '600px', width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Create New Set</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            placeholder="New Set Name"
            value={newSetName}
            onChange={(e) => setNewSetName(e.target.value)}
            style={{ flexGrow: 1 }}
          />
          <button onClick={handleCreateSet} className="button" style={{ padding: '0.8rem 1.2rem', fontSize: '0.9rem' }}>
            Add Set
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', width: '100%', maxWidth: '1000px' }}>
        {sets.length === 0 ? (
          <p className="glass-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem' }}>
            No sets created yet. Start by adding one above!
          </p>
        ) : (
          sets.map((set) => (
            <div key={set.id} className="glass-card flex-column gap-3" style={{ justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {set.name}
              </h3>
              <p style={{ opacity: 0.8 }}>Cards: {set.cards.length}</p>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button onClick={() => handleEditSet(set.id)} className="button button-secondary" style={{ flexGrow: 1 }}>
                  {editingSetId === set.id ? 'Close Editor' : 'Edit Set'}
                </button>
                <button onClick={() => handleDeleteSet(set.id)} className="button button-secondary" style={{ flexGrow: 1, backgroundColor: 'rgba(255, 0, 0, 0.2)', borderColor: 'rgba(255, 0, 0, 0.4)' }}>
                  Delete
                </button>
              </div>

              {editingSetId === set.id && (
                <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                  <h4 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Cards in "{set.name}"</h4>
                  {set.cards.length === 0 ? (
                    <p style={{ opacity: 0.7, marginBottom: '1rem' }}>No cards in this set yet.</p>
                  ) : (
                    <ul style={{ listStyle: 'none', padding: 0, maxHeight: '200px', overflowY: 'auto', marginBottom: '1rem' }}>
                      {set.cards.map(card => (
                        <li key={card.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px dotted rgba(255,255,255,0.1)' }}>
                          <span style={{ opacity: 0.9 }}>{card.front.substring(0, 30)}{card.front.length > 30 ? '...' : ''}</span>
                          <button onClick={() => handleDeleteCard(set.id, card.id)} className="button-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', backgroundColor: 'rgba(255, 0, 0, 0.1)', borderColor: 'transparent' }}>
                            Delete
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}

                  <button onClick={() => setShowAddCardForm(!showAddCardForm)} className="button button-secondary" style={{ width: '100%', marginBottom: '1rem' }}>
                    {showAddCardForm ? 'Hide Add Card Form' : 'Add New Card'}
                  </button>

                  {showAddCardForm && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '1rem' }}>
                      <input
                        type="text"
                        placeholder="Card Front (Question)"
                        value={newCardFront}
                        onChange={(e) => setNewCardFront(e.target.value)}
                      />
                      <textarea
                        placeholder="Card Back (Answer)"
                        value={newCardBack}
                        onChange={(e) => setNewCardBack(e.target.value)}
                        rows="3"
                        style={{ resize: 'vertical' }}
                      />
                      <button onClick={() => handleAddCard(set.id)} className="button">
                        Add Card to Set
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
