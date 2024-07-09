'use client';

import { useState } from 'react';
import Head from 'next/head';

export default function Home() {
  const [input, setInput] = useState('');
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const [keywords, setKeywords] = useState({
    soloKeywords: [],
    twoWordKeywords: [],
    threeWordKeywords: [],
  });
  const [stats, setStats] = useState({
    words: 0,
    characters: 0,
    charactersNoSpace: 0,
    syllables: 0,
    sentences: 0,
    paragraphs: 0,
    readingTime: 0,
    speakingTime: 0,
  });
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const fetchTextFromUrl = async (url) => {
    try {
      const response = await fetch(`/api/fetch-text?url=${encodeURIComponent(url)}`);
      const data = await response.json();
      return data.text;
    } catch (error) {
      console.error('Error fetching text from URL:', error);
      return '';
    }
  };

  const countSyllables = (word) => {
    word = word.toLowerCase();
    if (word.length <= 3) return 1;
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
    word = word.replace(/^y/, '');
    const matches = word.match(/[aeiouy]{1,2}/g);
    return matches ? matches.length : 1;
  };

  const calculateStats = (text) => {
    const words = text.split(/\s+/).filter(Boolean);
    const characters = text.length;
    const charactersNoSpace = text.replace(/\s+/g, '').length;
    const syllables = words.reduce((acc, word) => acc + countSyllables(word), 0);
    const sentences = text.split(/[.!?]/).filter(Boolean).length;
    const paragraphs = text.split(/\n+/).filter(Boolean).length;
    const readingTime = Math.ceil(words.length / 200); // average reading speed of 200 words per minute
    const speakingTime = Math.ceil(words.length / 150); // average speaking speed of 150 words per minute

    return {
      words: words.length,
      characters,
      charactersNoSpace,
      syllables,
      sentences,
      paragraphs,
      readingTime,
      speakingTime,
    };
  };

  const extractKeywords = (text) => {
    const words = text.toLowerCase().split(/\s+/);

    const countKeywords = (n) => {
      const counts = {};
      for (let i = 0; i <= words.length - n; i++) {
        const keyword = words.slice(i, i + n).join(' ');
        if (!counts[keyword]) {
          counts[keyword] = 0;
        }
        counts[keyword]++;
      }
      return Object.keys(counts)
        .map((key) => ({ word: key, count: counts[key] }))
        .sort((a, b) => b.count - a.count);
    };

    return {
      soloKeywords: countKeywords(1),
      twoWordKeywords: countKeywords(2),
      threeWordKeywords: countKeywords(3),
    };
  };

  const handleExtract = async () => {
    let extractedText = text;
    if (isValidUrl(url)) {
      extractedText = await fetchTextFromUrl(url);
    } else {
      extractedText = input;
    }
    setText(extractedText);
    setKeywords(extractKeywords(extractedText));
    setStats(calculateStats(extractedText));
  };

  const handleCopy = () => {
    const textContent = `Three-word Keywords:\n${keywords.threeWordKeywords
      .map(({ word, count }) => `${word}: ${count}`)
      .join('\n')}\n\nTwo-word Keywords:\n${keywords.twoWordKeywords
      .map(({ word, count }) => `${word}: ${count}`)
      .join('\n')}\n\nSolo Keywords:\n${keywords.soloKeywords
      .map(({ word, count }) => `${word}: ${count}`)
      .join('\n')}`;
    navigator.clipboard.writeText(textContent).then(() => {
      alert('Keywords copied to clipboard!');
    }).catch((err) => {
      console.error('Could not copy text: ', err);
    });
  };

  const handleDownload = () => {
    const csvContent = `data:text/csv;charset=utf-8,Three-word Keywords\n${keywords.threeWordKeywords
      .map(({ word, count }) => `${word},${count}`)
      .join('\n')}\n\nTwo-word Keywords\n${keywords.twoWordKeywords
      .map(({ word, count }) => `${word},${count}`)
      .join('\n')}\n\nSolo Keywords\n${keywords.soloKeywords
      .map(({ word, count }) => `${word},${count}`)
      .join('\n')}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'keywords.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const displayKeywords = (keywordsList) => {
    const start = currentPage * itemsPerPage;
    const end = start + itemsPerPage;
    return keywordsList.slice(start, end).map(({ word, count }, index) => (
      <div key={index} className="p-2 bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg shadow mb-2">
        <p className="font-semibold">{word}</p>
        <p className="text-sm text-gray-700">{count} times</p>
      </div>
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-100 to-gray-200">
      <Head>
        <title>Keyword Extractor</title>
      </Head>
      <main className="container mx-auto p-6 bg-white shadow-md rounded-lg">
        <h1 className="text-4xl font-bold text-center mb-6">Keyword Extractor</h1>
        <p className="text-center mb-6">Type or paste your text or URL to see the most used keywords</p>
        <div className="mb-6">
          <input
            type="text"
            className="w-full p-3 mb-4 border rounded"
            placeholder="Enter URL here..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <textarea
            className="w-full p-3 mb-4 border rounded"
            rows="4"
            placeholder="Enter text here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          ></textarea>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded mb-6 hover:bg-blue-600 transition duration-200"
            onClick={handleExtract}
          >
            Extract Keywords
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Three-word Keywords</h2>
            {displayKeywords(keywords.threeWordKeywords)}
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">Two-word Keywords</h2>
            {displayKeywords(keywords.twoWordKeywords)}
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">Solo Keywords - Part 1</h2>
            {displayKeywords(keywords.soloKeywords)}
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">Solo Keywords - Part 2</h2>
            {displayKeywords(keywords.soloKeywords)}
          </div>
        </div>
        <div className="flex justify-between items-center mb-6">
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200"
            disabled={currentPage === 0}
            onClick={() => setCurrentPage((prev) => prev - 1)}
          >
            Previous
          </button>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-200"
            disabled={
              (currentPage + 1) * itemsPerPage >=
              Math.max(
                keywords.soloKeywords.length,
                keywords.twoWordKeywords.length,
                keywords.threeWordKeywords.length
              )
            }
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            Next
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-2">Statistics</h2>
            <p>Words: {stats.words}</p>
            <p>Characters: {stats.characters}</p>
            <p>Characters (no space): {stats.charactersNoSpace}</p>
            <p>Syllables: {stats.syllables}</p>
            <p>Sentences: {stats.sentences}</p>
            <p>Paragraphs: {stats.paragraphs}</p>
            <p>Reading time: {stats.readingTime} min</p>
            <p>Speaking time: {stats.speakingTime} min</p>
          </div>
        </div>
        <div className="flex justify-between items-center mb-6">
          <button
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-200"
            onClick={handleDownload}
          >
            Download CSV
          </button>
          <button
            className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition duration-200"
            onClick={handleCopy}
          >
            Copy to Clipboard
          </button>
        </div>
        <button>Download The App</button>
        <footer className="text-center text-gray-600">
          Powered by{' '}
          <a href="https://nichetools.net" className="text-blue-500">
            Niche Tools
          </a><br></br>
          <a href="/privacy-policy">Privacy Policy</a>
        </footer>
      </main>
    </div>
  );
}
