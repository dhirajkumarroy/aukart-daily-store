import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  FileSpreadsheet, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  Loader2, 
  FileText 
} from 'lucide-react';
import Swal from 'sweetalert2';
import { importProductsBulk, downloadImportTemplate } from '../utils/api';

export default function BulkImportModal({ isOpen, onClose, onSuccess, token }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleDownloadTemplate = async () => {
    setDownloading(true);
    try {
      await downloadImportTemplate();
    } catch (err) {
      console.error('Template download error:', err);
      Swal.fire('Error', 'Failed to download template. Make sure backend is running.', 'error');
    } finally {
      setDownloading(false);
    }
  };

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return;

    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const fileName = selectedFile.name.toLowerCase();
    const isValid = validExtensions.some(ext => fileName.endsWith(ext));

    if (!isValid) {
      setError('Please select a valid Excel (.xlsx, .xls) or CSV (.csv) file.');
      return;
    }

    setError(null);
    setResult(null);
    setFile(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleStartImport = async () => {
    if (!file) {
      setError('Please choose a file to import.');
      return;
    }

    setUploading(true);
    setError(null);
    setResult(null);

    try {
      const response = await importProductsBulk(file, token);
      setResult(response);

      if (response.importedCount > 0) {
        Swal.fire({
          title: 'Import Successful!',
          text: `Successfully imported ${response.importedCount} products into your catalog!`,
          icon: 'success',
          timer: 2500,
          showConfirmButton: false
        });
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (err) {
      console.error('Import error:', err);
      setError(err.message || 'Failed to process spreadsheet.');
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-neutral-100 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-100 bg-neutral-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-900">Bulk Product Import</h2>
              <p className="text-xs text-neutral-500">Upload multiple products from an Excel (.xlsx) or CSV file.</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-600 rounded-xl hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Step 1: Download Template */}
          <div className="bg-emerald-50/40 border border-emerald-100 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xs font-bold text-emerald-950 uppercase tracking-wider mb-1">
                Step 1: Get Pre-formatted Template
              </h3>
              <p className="text-xs text-emerald-800 leading-relaxed">
                Download the sample CSV file containing all required headers and example product rows.
              </p>
            </div>

            <button
              onClick={handleDownloadTemplate}
              disabled={downloading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-colors flex-shrink-0 cursor-pointer disabled:opacity-50"
            >
              {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Download Template (.csv)
            </button>
          </div>

          {/* Step 2: Upload File Area */}
          <div>
            <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">
              Step 2: Choose your completed file
            </h3>

            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={(e) => handleFileSelect(e.target.files[0])}
              className="hidden"
            />

            {!file ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                  isDragging
                    ? 'border-emerald-500 bg-emerald-50/50 scale-[0.99]'
                    : 'border-neutral-200 hover:border-emerald-500 bg-neutral-50/30 hover:bg-neutral-50'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-neutral-800">
                    Click to browse or drag and drop your spreadsheet
                  </p>
                  <p className="text-xs text-neutral-400 mt-1">
                    Supports Microsoft Excel (.xlsx, .xls) and CSV (.csv) files
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-neutral-900 truncate max-w-[280px] sm:max-w-md">
                      {file.name}
                    </p>
                    <p className="text-xs text-neutral-400">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleReset}
                  disabled={uploading}
                  className="text-xs font-semibold text-neutral-500 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-neutral-200/60 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Change File
                </button>
              </div>
            )}
          </div>

          {/* Error Notice */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-2xl p-4 flex items-start gap-3 text-xs">
              <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold mb-0.5">Import Notice</p>
                <p>{error}</p>
              </div>
            </div>
          )}

          {/* Results Summary */}
          {result && (
            <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-5 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-600">Import Summary</h4>
              
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-white border border-neutral-100 rounded-xl p-3">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block">Total Rows</span>
                  <span className="text-xl font-extrabold text-neutral-900">{result.totalRows}</span>
                </div>
                <div className="bg-white border border-emerald-100 rounded-xl p-3 text-emerald-700">
                  <span className="text-[10px] uppercase font-bold text-emerald-500 block">Imported</span>
                  <span className="text-xl font-extrabold">{result.importedCount}</span>
                </div>
                <div className="bg-white border border-red-100 rounded-xl p-3 text-red-700">
                  <span className="text-[10px] uppercase font-bold text-red-400 block">Skipped / Failed</span>
                  <span className="text-xl font-extrabold">{result.failedCount}</span>
                </div>
              </div>

              {result.errors && result.errors.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-bold text-red-700 mb-1">Errors Details:</p>
                  <ul className="text-[11px] text-red-600 max-h-32 overflow-y-auto space-y-1 bg-red-50/50 p-2.5 rounded-xl border border-red-100">
                    {result.errors.map((err, i) => (
                      <li key={i}>• {err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-neutral-100 bg-neutral-50/50 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={uploading}
            className="px-5 py-2.5 text-xs font-semibold text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/50 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
          >
            {result ? 'Close' : 'Cancel'}
          </button>

          {!result && (
            <button
              onClick={handleStartImport}
              disabled={uploading || !file}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Spreadsheet...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Start Bulk Import</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
