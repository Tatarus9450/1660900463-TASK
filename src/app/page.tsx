"use client";

import { useState, useEffect, useCallback } from 'react';
import { Word, Difficulty } from '@/types';

const API_BASE_URL = '/api';

const getScoreColor = (value: number) => {
    if (value >= 8.0) {
        return 'text-success';
    }
    if (value >= 6.0) {
        return 'text-warning';
    }
    return 'text-danger';
};

export default function Home() {
    const [currentWord, setCurrentWord] = useState<Word | null>(null);
    const [sentence, setSentence] = useState('');
    const [score, setScore] = useState(0);
    const [feedbackColor, setFeedbackColor] = useState('text-gray-700');
    const [feedbackMessage, setFeedbackMessage] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getRandomWord = useCallback(async () => {
        try {
            setError(null);
            const response = await fetch(`${API_BASE_URL}/word`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                cache: 'no-store',
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data: Word = await response.json();
            setCurrentWord(data);
            setSentence('');
            setScore(0);
            setFeedbackColor('text-gray-700');
            setFeedbackMessage('');
            setIsSubmitted(false);
        } catch (err) {
            console.error('Error fetching word:', err);
            setCurrentWord(null);
            setError('ไม่สามารถดึงคำศัพท์ได้ กรุณาลองใหม่');
        }
    }, []);

    useEffect(() => {
        getRandomWord();
    }, [getRandomWord]);

    const handleSentenceChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setSentence(e.target.value);
        if (isSubmitted) {
            setScore(0);
            setFeedbackColor('text-gray-700');
            setIsSubmitted(false);
        }
        setFeedbackMessage('');
        setError(null);
    };

    const handleSubmitSentence = async () => {
        if (!currentWord) {
            return;
        }

        const sanitizedSentence = sentence.trim();
        if (!sanitizedSentence) {
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch(`${API_BASE_URL}/validate-sentence`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    word_id: currentWord.id,
                    sentence: sanitizedSentence,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            const numericScore = typeof result.score === 'number' ? result.score : Number(result.score || 0);

            setScore(numericScore);
            setFeedbackColor(getScoreColor(numericScore));
            setFeedbackMessage(result.suggestion || '');
            setIsSubmitted(true);

            // Save to localStorage
            const history = JSON.parse(localStorage.getItem('wordHistory') || '[]');
            history.push({
                word: currentWord.word,
                sentence: sanitizedSentence,
                score: numericScore,
                difficulty: result.level || currentWord.difficulty_level,
                timestamp: new Date().toISOString(),
                suggestion: result.suggestion,
                corrected_sentence: result.corrected_sentence,
            });
            localStorage.setItem('wordHistory', JSON.stringify(history));
        } catch (err) {
            console.error('Error validating sentence:', err);
            setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดระหว่างประเมินประโยค');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleNextWord = () => {
        setError(null);
        getRandomWord();
    };

    const getDifficultyColor = (difficulty: Difficulty) => {
        switch (difficulty) {
            case 'Beginner':
                return 'bg-green-200 text-green-800';
            case 'Intermediate':
                return 'bg-yellow-200 text-yellow-800';
            case 'Advanced':
                return 'bg-red-200 text-red-800';
            default:
                return 'bg-gray-200 text-gray-800';
        }
    };

    if (!currentWord) {
        return (
            <div className="flex h-screen flex-col items-center justify-center space-y-4">
                {error ? (
                    <>
                        <p className="text-lg text-red-600">{error}</p>
                        <button
                            onClick={getRandomWord}
                            className="rounded-lg bg-primary px-6 py-3 font-medium text-white shadow-md transition hover:bg-secondary"
                        >
                            ลองใหม่
                        </button>
                    </>
                ) : (
                    <p>Loading word...</p>
                )}
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-3xl p-4">
            <h1 className="mb-8 text-center text-4xl font-extrabold leading-tight text-gray-800 md:text-5xl">
                Word Challenge
            </h1>

            {error && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
                    {error}
                </div>
            )}

            <div className="mb-6 transform rounded-2xl border border-gray-100 bg-white p-8 shadow-xl transition-transform duration-300 ease-in-out hover:scale-105">
                <div className="mb-4 flex flex-col items-start justify-between sm:flex-row sm:items-center">
                    <h2 className="text-3xl font-bold text-primary md:text-4xl">
                        {currentWord.word}
                    </h2>
                    <span
                        className={`rounded-full px-4 py-1 text-sm font-semibold shadow-md ${getDifficultyColor(
                            currentWord.difficulty_level
                        )}`}
                    >
                        {currentWord.difficulty_level}
                    </span>
                </div>
                <p className="mb-6 text-lg leading-relaxed text-gray-700 md:text-xl">
                    {currentWord.definition}
                </p>

                <div className="mb-6">
                    <label
                        htmlFor="sentence"
                        className="mb-2 block text-base font-medium text-gray-700"
                    >
                        Your Sentence:
                    </label>
                    <textarea
                        id="sentence"
                        className="w-full resize-y rounded-lg border border-gray-300 p-4 text-lg transition duration-200 ease-in-out focus:border-primary focus:ring-primary"
                        rows={4}
                        placeholder="Type your sentence here..."
                        value={sentence}
                        onChange={handleSentenceChange}
                        disabled={isSubmitted || isSubmitting}
                    ></textarea>
                </div>

                <div className="mb-6 flex flex-col items-center justify-between space-y-4 sm:flex-row sm:space-y-0">
                    <p className="text-2xl font-bold">
                        Score:{' '}
                        <span
                            className={`${feedbackColor} transition-colors duration-300`}
                        >
                            {score.toFixed(1)}
                        </span>
                    </p>
                    <div className="flex space-x-3">
                        {!isSubmitted ? (
                            <button
                                onClick={handleSubmitSentence}
                                className="rounded-lg bg-primary px-6 py-3 font-medium text-white shadow-md transition duration-200 ease-in-out hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-70"
                                disabled={!sentence.trim() || isSubmitting}
                            >
                                {isSubmitting ? 'Scoring...' : 'Submit Sentence'}
                            </button>
                        ) : (
                            <button
                                onClick={handleNextWord}
                                className="rounded-lg bg-info px-6 py-3 font-medium text-white shadow-md transition duration-200 ease-in-out hover:bg-blue-700"
                            >
                                Next Word
                            </button>
                        )}
                    </div>
                </div>

                {feedbackMessage && isSubmitted && (
                    <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 p-4 text-blue-800">
                        <p className="mb-1 font-semibold">AI Feedback</p>
                        <p className="text-sm">{feedbackMessage}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
