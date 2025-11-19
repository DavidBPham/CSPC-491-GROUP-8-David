import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from './Header';

const GenerateQuiz = ({ user, setUser }) => {
  const [activeTab, setActiveTab] = useState('upload');
  const [textContent, setTextContent] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [numQuestions, setNumQuestions] = useState(10);
  const [generatedQuiz, setGeneratedQuiz] = useState(null);
  
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain',
      'text/markdown'
    ];

    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a PDF, DOC, DOCX, TXT, or MD file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setUploadedFile(file);
    setError('');
  };

  const removeFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    setGeneratedQuiz(null);

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Please login to generate quizzes');
        navigate('/login');
        return;
      }

      let response;
      const apiBase = API_URL ? API_URL.replace(/\/$/, '') : '';
      
      if (activeTab === 'upload' && uploadedFile) {
        const formData = new FormData();
        formData.append('file', uploadedFile);
        formData.append('numQuestions', numQuestions);

        const endpoint = `${apiBase}/api/quiz/generate/file`;
        
        response = await axios.post(endpoint, formData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      } else if (activeTab === 'text' && textContent.trim()) {
        const endpoint = `${apiBase}/api/quiz/generate/text`;
        
        response = await axios.post(endpoint, {
          text: textContent,
          numQuestions: numQuestions
        }, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      } else {
        setError('Please provide content to generate quiz from');
        setLoading(false);
        return;
      }

      if (response.data) {
        setGeneratedQuiz(response.data);
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }

    } catch (err) {
      console.error('Generate quiz error:', err);
      const errorMsg = err.response?.data?.msg || 'Failed to generate quiz';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header user={user} setUser={setUser} showAuthLinks={false} />
      
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Generate Quiz</h1>
          <p className="text-gray-600">
            Upload a document or paste text to generate AI-powered quiz questions
          </p>
        </div>

        {generatedQuiz ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-green-900 mb-2">Quiz Generated!</h3>
            <p className="text-green-700 mb-4">
              Successfully created {generatedQuiz.numQuestions} questions
            </p>
            <p className="text-sm text-gray-600">Redirecting to dashboard...</p>
          </div>
        ) : (
          <>
            <div className="flex mb-6 border-b border-gray-200">
              <button
                onClick={() => setActiveTab('upload')}
                className={`px-6 py-3 font-semibold ${
                  activeTab === 'upload'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center">
                  <Upload className="w-5 h-5 mr-2" />
                  Upload File
                </div>
              </button>
              <button
                onClick={() => setActiveTab('text')}
                className={`px-6 py-3 font-semibold ${
                  activeTab === 'text'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Paste Text
                </div>
              </button>
            </div>

            {activeTab === 'upload' ? (
              <div
                className={`border-2 border-dashed rounded-lg p-12 text-center ${
                  dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {uploadedFile ? (
                  <div className="bg-blue-50 rounded-lg p-6">
                    <FileText className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                    <p className="font-semibold text-gray-900 mb-2">
                      {uploadedFile.name}
                    </p>
                    <p className="text-sm text-gray-600 mb-4">
                      {(uploadedFile.size / 1024).toFixed(2)} KB
                    </p>
                    <button
                      onClick={removeFile}
                      className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                    >
                      Remove File
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-xl font-semibold text-gray-700 mb-2">
                      Drop your file here or click to browse
                    </p>
                    <p className="text-sm text-gray-500 mb-6">
                      Supported formats: PDF, DOC, DOCX, TXT, MD (Max 10MB)
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileInput}
                      accept=".pdf,.doc,.docx,.txt,.md"
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                    >
                      Select File
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div>
                <textarea
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  placeholder="Paste your text here... (lecture notes, article, study material, etc.)"
                  className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Minimum 100 characters recommended for better quiz generation
                </p>
              </div>
            )}

            <div className="mt-6 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <label className="text-gray-700 font-semibold">
                  Number of Questions:
                </label>
                <input
                  type="number"
                  min="5"
                  max="20"
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(parseInt(e.target.value) || 10)}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                onClick={handleGenerate}
                disabled={loading || (activeTab === 'upload' && !uploadedFile) || (activeTab === 'text' && !textContent.trim())}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Generating...
                  </>
                ) : (
                  'Generate Quiz'
                )}
              </button>
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default GenerateQuiz;
