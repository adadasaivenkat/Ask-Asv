import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/clerk-react';
import { UploadCloud as UploadCloudIcon, FileText, Trash2, HelpCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const API_URL = import.meta.env.VITE_API_URL;

function useWindowWidth() {
  const [width, setWidth] = React.useState(window.innerWidth);
  React.useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return width;
}

const AdminUpload = () => {
  const { user } = useUser();
  
  // Only show for admins
  if (!user || user.publicMetadata?.role !== 'admin') return null;

  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [faqs, setFaqs] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const fileInputRef = useRef();

  // const windowWidth = useWindowWidth();
  // const visibleChunks = windowWidth < 768 ? 2 : 6; // 2 for mobile, 6 for desktop
  const visibleChunks = 6;

  // Fetch all FAQs
  const fetchFaqs = async () => {
    const res = await fetch(`${API_URL}/api/faqs`);
    const data = await res.json();
    setFaqs(data);
  };
  
  useEffect(() => { 
    fetchFaqs(); 
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setResult(null);
    setError(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setResult(null);
      setError(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    
    setUploading(true);
    setResult(null);
    setError(null);
    setProgress(0);
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${API_URL}/api/faqs/upload-file`);
      
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          setProgress(Math.round((event.loaded / event.total) * 100));
        }
      };
      
      xhr.onload = async () => {
        const data = JSON.parse(xhr.responseText);
        if (data.success) {
          setResult(`Uploaded successfully: ${file.name} (${data.count} chunks)`);
          setSuccessMsg(`Uploaded successfully: ${file.name} (${data.count} chunks)`);
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 4000);
          await fetchFaqs();
        } else {
          setError(data.error || 'Upload failed');
        }
        setUploading(false);
        setProgress(0);
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = null;
      };
      
      xhr.onerror = () => {
        setError('Upload failed');
        setUploading(false);
        setProgress(0);
      };
      
      xhr.send(formData);
    } catch (err) {
      setError('Upload failed');
      setUploading(false);
      setProgress(0);
    }
  };

  const handleDeleteAll = async () => {
    setShowDeleteModal(true);
  };

  const confirmDeleteAll = async () => {
    try {
      const res = await fetch(`${API_URL}/api/faqs/all`, { method: 'DELETE' });
      if (res.ok) {
        setFaqs([]);
        setShowDeleteModal(false);
      }
    } catch (err) {
      console.error('Failed to delete all FAQs:', err);
    }
  };

  const cancelDeleteAll = () => {
    setShowDeleteModal(false);
  };

  const handleDeleteOne = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/faqs/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setFaqs(faqs.filter(faq => faq._id !== id));
      }
    } catch (err) {
      console.error('Failed to delete FAQ:', err);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UploadCloudIcon className="h-6 w-6" />
            Upload FAQ Document
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1"
            >
              <UploadCloudIcon className="h-4 w-4 mr-2" />
              Choose File
            </Button>
            <Button
              variant="outline"
              onClick={() => setModalOpen(true)}
            >
              <HelpCircle className="h-4 w-4 mr-2" />
              Instructions
            </Button>
          </div>
          
          <Input
            ref={fileInputRef}
            type="file"
            accept=".txt,.pdf,.doc,.docx"
            onChange={handleFileChange}
            className="hidden"
          />
          
          {file && (
            <div className="p-4 border rounded-lg bg-muted">
              <p className="text-sm font-medium">Selected file: {file.name}</p>
            </div>
          )}
          
          {uploading && (
            <div className="space-y-2">
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground">Uploading... {progress}%</p>
            </div>
          )}
          
          {result && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg dark:bg-green-950 dark:border-green-800">
              <p className="text-sm text-green-800 dark:text-green-200">{result}</p>
            </div>
          )}
          
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg dark:bg-red-950 dark:border-red-800">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}
          
          <Button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="w-full"
          >
            {uploading ? 'Uploading...' : 'Upload File'}
          </Button>
        </CardContent>
      </Card>

      {modalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <CardHeader>
              <CardTitle>FAQ Upload Instructions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p><strong>Supported formats:</strong> .txt, .pdf, .doc, .docx</p>
                <p><strong>Format:</strong> Your document should contain Q&A pairs in this format:</p>
                <pre className="bg-muted p-4 rounded-lg text-sm overflow-hidden">
{`Q: What is your question here?
A: This is the answer to the question.

Q: Another question?
A: Another answer.`}
                </pre>
                <p><strong>Note:</strong> Each Q&A pair will be split into separate chunks for better search results.</p>
              </div>
              <Button onClick={() => setModalOpen(false)} className="w-full">
                Close
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
      
      {showDeleteModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Confirm Delete</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>Are you sure you want to delete all FAQ chunks?</p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={cancelDeleteAll} className="flex-1">
                  Cancel
                </Button>
                <Button variant="destructive" onClick={confirmDeleteAll} className="flex-1">
                  Delete All
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Uploaded Chunks ({faqs.length})</CardTitle>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteAll}
              disabled={faqs.length === 0}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {faqs.slice(0, visibleChunks).map(faq => (
              <div key={faq._id} className="p-4 border rounded-lg bg-muted/50">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div className="font-medium">Q: {faq.question}</div>
                    </div>
                    <div className="text-sm text-muted-foreground ml-6">
                      A: {faq.answer}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteOne(faq._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUpload; 