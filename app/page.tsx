'use client';

import { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { XmlPreview } from '@/components/XmlPreview';
import { parseCSV } from '@/lib/csvParser';

export default function Home() {
    const [xmlContent, setXmlContent] = useState<string>('');
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [error, setError] = useState<string>('');
    const [xmlUrl, setXmlUrl] = useState<string>('');

    const handleFileUpload = async (file: File) => {
        try {
            setError('');
            const products = await parseCSV(file);

            const response = await fetch('/api/feed', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ products }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate XML feed');
            }

            const data = await response.json();
            setXmlContent(data.xml);
            setXmlUrl(`${window.location.origin}/api/feed`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        }
    };

    const downloadXml = () => {
        const blob = new Blob([xmlContent], { type: 'text/xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'heureka-feed.xml';
        a.click();
    };

    return (
        <div className='min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
            <div className='max-w-3xl mx-auto'>
                <div className='bg-white shadow sm:rounded-lg'>
                    <div className='px-4 py-5 sm:p-6'>
                        <h1 className='text-2xl font-semibold text-gray-900 mb-4'>
                            Shopify to Heureka XML Feed
                        </h1>
                        <p className='text-gray-600 mb-6'>
                            Upload your Shopify products CSV file to generate a
                            Heureka-compatible XML feed.
                        </p>

                        <FileUpload onFileUpload={handleFileUpload} />

                        {error && (
                            <div className='mt-4 p-4 bg-red-50 rounded-md'>
                                <p className='text-sm text-red-700'>{error}</p>
                            </div>
                        )}

                        {xmlUrl && (
                            <div className='mt-6 space-y-4'>
                                <div className='flex items-center space-x-4'>
                                    <button
                                        onClick={() => setIsPreviewOpen(true)}
                                        className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                                    >
                                        Preview XML
                                    </button>
                                    <button
                                        onClick={() => downloadXml()}
                                        className='inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                                    >
                                        Download XML
                                    </button>
                                </div>
                                {/* <p className='text-sm text-gray-500'>
                                    Your XML feed is available at:{' '}
                                    <code className='text-sm bg-gray-100 px-2 py-1 rounded'>
                                        {xmlUrl}
                                    </code>
                                </p> */}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <XmlPreview
                xml={xmlContent}
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
            />
        </div>
    );
}
