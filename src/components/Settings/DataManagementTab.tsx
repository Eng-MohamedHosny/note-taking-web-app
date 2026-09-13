import React, { useState, useRef } from 'react';
import { useNotes } from '../../context/NotesContext';
import { ImportStrategy, Note } from '../../types/note';
import { exportAllToJSON, exportAllToZip, parseImportFiles, ParsedImportResult } from '../../utils/formatters';
import {
  Download,
  Upload,
  FileText,
  Archive,
  Database,
  Check,
  AlertTriangle,
  Folder as FolderIcon,
  Tag as TagIcon,
  X,
  Loader2,
  FileArchive
} from 'lucide-react';

export const DataManagementTab: React.FC = () => {
  const {
    notes,
    allFolders,
    allTags,
    pinnedFolders,
    pinnedTags,
    importNotes,
    addToast
  } = useNotes();

  const [isExportingZip, setIsExportingZip] = useState(false);
  const [isParsingFiles, setIsParsingFiles] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [importStrategy, setImportStrategy] = useState<ImportStrategy>('merge');
  const [parsedData, setParsedData] = useState<ParsedImportResult | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeNotesCount = notes.filter((n) => !n.isDeleted).length;

  const handleExportJSON = () => {
    exportAllToJSON(notes, allFolders, pinnedFolders, pinnedTags);
    addToast(`Exported ${activeNotesCount} notes as JSON`, 'success');
  };

  const handleExportZip = async () => {
    if (activeNotesCount === 0) {
      addToast('No notes to export', 'info');
      return;
    }
    try {
      setIsExportingZip(true);
      await exportAllToZip(notes);
      addToast(`Exported ${activeNotesCount} notes as Markdown archive (.zip)`, 'success');
    } catch (err: any) {
      addToast(`Export failed: ${err.message || 'Unknown error'}`, 'error');
    } finally {
      setIsExportingZip(false);
    }
  };

  const processFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    setIsParsingFiles(true);
    try {
      const result = await parseImportFiles(files);
      if (result.notes.length === 0 && result.errors.length > 0) {
        addToast(result.errors[0], 'error');
        setParsedData(null);
      } else {
        setParsedData(result);
        if (result.errors.length > 0) {
          addToast(`Parsed ${result.notes.length} notes with ${result.errors.length} warning(s)`, 'info');
        }
      }
    } catch (err: any) {
      addToast(`Failed to parse files: ${err.message || 'Unknown error'}`, 'error');
    } finally {
      setIsParsingFiles(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
    // reset input so same file can be chosen again if needed
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleConfirmImport = () => {
    if (!parsedData || parsedData.notes.length === 0) return;
    setIsImporting(true);
    try {
      importNotes(parsedData.notes, importStrategy, parsedData.folders);
      setParsedData(null);
    } catch (err: any) {
      addToast(`Import failed: ${err.message || 'Unknown error'}`, 'error');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-8 pb-12 animate-in fade-in duration-200">
      {/* Overview Stats */}
      <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-[#335CFF]" />
            Workspace Data Overview
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Your local storage contains your notes, custom folders, and tags.
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs font-medium">
          <span className="px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/60">
            {activeNotesCount} Notes
          </span>
          <span className="px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700">
            {allFolders.length} Folders
          </span>
          <span className="px-2.5 py-1 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-900/60">
            {allTags.length} Tags
          </span>
        </div>
      </div>

      {/* 1. Export Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <Download className="w-4 h-4 text-emerald-500" />
            Export Notes
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Back up your notes or transfer them to another device or application.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Card 1: JSON Backup */}
          <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex flex-col justify-between hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors shadow-2xs">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">
                Complete JSON Backup
              </h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                Full lossless backup containing all your notes, custom folders, tags, timestamps, and pins. Perfect for restoring on another computer.
              </p>
            </div>
            <button
              type="button"
              onClick={handleExportJSON}
              className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-[#335CFF] text-white hover:bg-blue-600 transition-colors cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download JSON Backup</span>
            </button>
          </div>

          {/* Card 2: Markdown ZIP Archive */}
          <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex flex-col justify-between hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors shadow-2xs">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <FileArchive className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">
                Markdown Archive (.zip)
              </h4>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                Downloads all notes as formatted <code className="text-[11px] bg-neutral-100 dark:bg-neutral-800 px-1 rounded">.md</code> files, organized inside actual folder subdirectories with YAML frontmatter. Compatible with Obsidian & Notion.
              </p>
            </div>
            <button
              type="button"
              onClick={handleExportZip}
              disabled={isExportingZip}
              className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
            >
              {isExportingZip ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Packaging ZIP…</span>
                </>
              ) : (
                <>
                  <Archive className="w-3.5 h-3.5" />
                  <span>Export as Markdown ZIP</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="h-px bg-neutral-200 dark:bg-neutral-800" />

      {/* 2. Import Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <Upload className="w-4 h-4 text-[#335CFF]" />
            Import Notes
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Import notes from a JSON backup file or multiple Markdown (<code className="text-[11px] bg-neutral-100 dark:bg-neutral-800 px-1 rounded">.md</code>) and Text (<code className="text-[11px] bg-neutral-100 dark:bg-neutral-800 px-1 rounded">.txt</code>) documents.
          </p>
        </div>

        {/* Strategy Selector */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
            Import Strategy:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label
              className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                importStrategy === 'merge'
                  ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-500 text-neutral-900 dark:text-white shadow-2xs'
                  : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300'
              }`}
            >
              <input
                type="radio"
                name="import-strategy"
                value="merge"
                checked={importStrategy === 'merge'}
                onChange={() => setImportStrategy('merge')}
                className="mt-0.5 accent-[#335CFF]"
              />
              <div className="space-y-0.5 text-xs">
                <span className="font-semibold block text-neutral-900 dark:text-white">
                  Merge with Existing Notes (Recommended)
                </span>
                <span className="text-[11px] opacity-80 leading-relaxed block">
                  Preserves all your current notes and smoothly appends new notes.
                </span>
              </div>
            </label>

            <label
              className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                importStrategy === 'replace'
                  ? 'bg-red-50/50 dark:bg-red-950/20 border-red-500 text-neutral-900 dark:text-white shadow-2xs'
                  : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300'
              }`}
            >
              <input
                type="radio"
                name="import-strategy"
                value="replace"
                checked={importStrategy === 'replace'}
                onChange={() => setImportStrategy('replace')}
                className="mt-0.5 accent-red-600"
              />
              <div className="space-y-0.5 text-xs">
                <span className="font-semibold text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Replace Entire Workspace
                </span>
                <span className="text-[11px] opacity-80 leading-relaxed block">
                  Replaces your entire library with the contents of the backup.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Drag & Drop File Zone */}
        {!parsedData && (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all ${
              isDragOver
                ? 'border-[#335CFF] bg-blue-50/50 dark:bg-blue-950/30'
                : 'border-neutral-300 dark:border-neutral-700 bg-neutral-50/40 dark:bg-neutral-900/40 hover:bg-neutral-50 dark:hover:bg-neutral-900/60'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".json,.md,.markdown,.txt"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-950/60 text-[#335CFF] flex items-center justify-center mb-3">
              {isParsingFiles ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <Upload className="w-6 h-6" />
              )}
            </div>
            <h4 className="text-sm font-semibold text-neutral-900 dark:text-white">
              {isParsingFiles ? 'Reading and parsing files…' : 'Drag and drop your notes here'}
            </h4>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm">
              Supports <strong className="text-neutral-700 dark:text-neutral-300">.json</strong> backups or multiple <strong className="text-neutral-700 dark:text-neutral-300">.md / .txt</strong> documents.
            </p>
            <button
              type="button"
              disabled={isParsingFiles}
              onClick={() => fileInputRef.current?.click()}
              className="mt-4 px-4 py-2 text-xs font-semibold rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90 transition-opacity cursor-pointer shadow-xs disabled:opacity-50"
            >
              Browse Files
            </button>
          </div>
        )}

        {/* Parsed Preview Card */}
        {parsedData && (
          <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-4 shadow-sm animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <div>
                <h4 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" />
                  Ready to Import {parsedData.notes.length} {parsedData.notes.length === 1 ? 'Note' : 'Notes'}
                </h4>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Review the detected notes and folders before applying.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setParsedData(null)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer"
                title="Cancel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Badges preview */}
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-medium">
                {parsedData.notes.length} Notes Detected
              </span>
              {parsedData.folders.length > 0 && (
                <span className="px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-medium flex items-center gap-1">
                  <FolderIcon className="w-3 h-3 text-blue-500" />
                  {parsedData.folders.length} Folders: {parsedData.folders.slice(0, 3).join(', ')}{parsedData.folders.length > 3 ? '…' : ''}
                </span>
              )}
              {parsedData.tags.length > 0 && (
                <span className="px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-medium flex items-center gap-1">
                  <TagIcon className="w-3 h-3 text-purple-500" />
                  {parsedData.tags.length} Tags
                </span>
              )}
            </div>

            {/* Note items scrollable list */}
            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 text-xs border border-neutral-100 dark:border-neutral-800 rounded-lg p-2 bg-neutral-50/50 dark:bg-neutral-950/50">
              {parsedData.notes.map((note, idx) => (
                <div
                  key={note.id || idx}
                  className="flex items-center justify-between px-2.5 py-1.5 rounded-md bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800"
                >
                  <span className="font-medium truncate max-w-[220px] text-neutral-800 dark:text-neutral-200">
                    {note.title}
                  </span>
                  <div className="flex items-center gap-2 text-[11px] text-neutral-400 shrink-0">
                    {note.folder && (
                      <span className="inline-flex items-center gap-1 text-blue-500">
                        <FolderIcon className="w-2.5 h-2.5" />
                        {note.folder}
                      </span>
                    )}
                    {note.tags.length > 0 && (
                      <span className="text-purple-500">
                        #{note.tags[0]}
                        {note.tags.length > 1 ? ` +${note.tags.length - 1}` : ''}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Warnings / Errors */}
            {parsedData.errors.length > 0 && (
              <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-xs text-amber-700 dark:text-amber-300 space-y-0.5">
                <div className="font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Warnings ({parsedData.errors.length}):
                </div>
                {parsedData.errors.map((err, i) => (
                  <div key={i} className="text-[11px] opacity-90">• {err}</div>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setParsedData(null)}
                className="px-3.5 py-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isImporting}
                onClick={handleConfirmImport}
                className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-lg text-white transition-colors cursor-pointer shadow-xs disabled:opacity-50 ${
                  importStrategy === 'replace'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-[#335CFF] hover:bg-blue-600'
                }`}
              >
                {isImporting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Importing…</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>
                      {importStrategy === 'replace' ? 'Replace & Import' : 'Merge & Import'}{' '}
                      ({parsedData.notes.length})
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
