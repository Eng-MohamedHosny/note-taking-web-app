import React from 'react';
import { useNotes } from '../../context/NotesContext';
import { HomeIcon, SearchIcon, ArchiveIcon, TagIcon } from '../Icons';
import { Folder as FolderIcon } from 'lucide-react';

interface BottomMenuBarProps {
  onOpenTagsModal: () => void;
  onOpenFoldersModal: () => void;
}

export const BottomMenuBar: React.FC<BottomMenuBarProps> = ({ onOpenTagsModal, onOpenFoldersModal }) => {
  const { activeView, setActiveView } = useNotes();

  const isHome = activeView.type === 'all';
  const isSearch = activeView.type === 'search';
  const isArchived = activeView.type === 'archived';
  const isTag = activeView.type === 'tag';
  const isFolder = activeView.type === 'folder';

  return (
    <nav
      aria-label="Bottom navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 h-16 md:h-[72px] bg-white dark:bg-[#0E121B] border-t border-[#E0E4EA] dark:border-[#232530] flex items-center justify-between px-3 md:px-8 z-30 shadow-lg select-none"
    >
      {/* Home Button matching Figma Tablet EL-9861f917 / Mobile EL-0bb99e3f */}
      <button
        type="button"
        onClick={() => setActiveView({ type: 'all' })}
        className={`flex-1 md:w-[80px] md:flex-initial py-1.5 md:py-1 flex flex-col items-center justify-center gap-1 rounded-[4px] transition-colors cursor-pointer ${
          isHome
            ? 'bg-[#EBF1FF] dark:bg-[#2B303B] text-[#335CFF]'
            : 'bg-transparent text-[#525866] dark:text-[#99A0AE] hover:bg-[#F3F5F8] dark:hover:bg-[#232530]/60'
        }`}
      >
        <HomeIcon className="w-5 h-5 md:w-5 md:h-5 shrink-0" />
        <span className="hidden md:block text-[12px] font-normal leading-none tracking-tight">Home</span>
      </button>

      {/* Divider (Tablet only, hidden on mobile matching Figma) */}
      <div className="hidden md:block w-px h-6 bg-[#E0E4EA] dark:bg-[#232530] shrink-0" />

      {/* Search Button matching Figma */}
      <button
        type="button"
        onClick={() => setActiveView({ type: 'search' })}
        className={`flex-1 md:w-[80px] md:flex-initial py-1.5 md:py-1 flex flex-col items-center justify-center gap-1 rounded-[4px] transition-colors cursor-pointer ${
          isSearch
            ? 'bg-[#EBF1FF] dark:bg-[#2B303B] text-[#335CFF]'
            : 'bg-transparent text-[#525866] dark:text-[#99A0AE] hover:bg-[#F3F5F8] dark:hover:bg-[#232530]/60'
        }`}
      >
        <SearchIcon className="w-5 h-5 md:w-5 md:h-5 shrink-0" />
        <span className="hidden md:block text-[12px] font-normal leading-none tracking-tight">Search</span>
      </button>

      {/* Divider */}
      <div className="hidden md:block w-px h-6 bg-[#E0E4EA] dark:bg-[#232530] shrink-0" />

      {/* Archived Button matching Figma */}
      <button
        type="button"
        onClick={() => setActiveView({ type: 'archived' })}
        className={`flex-1 md:w-[80px] md:flex-initial py-1.5 md:py-1 flex flex-col items-center justify-center gap-1 rounded-[4px] transition-colors cursor-pointer ${
          isArchived
            ? 'bg-[#EBF1FF] dark:bg-[#2B303B] text-[#335CFF]'
            : 'bg-transparent text-[#525866] dark:text-[#99A0AE] hover:bg-[#F3F5F8] dark:hover:bg-[#232530]/60'
        }`}
      >
        <ArchiveIcon className="w-5 h-5 md:w-5 md:h-5 shrink-0" />
        <span className="hidden md:block text-[12px] font-normal leading-none tracking-tight">Archived</span>
      </button>

      {/* Divider */}
      <div className="hidden md:block w-px h-6 bg-[#E0E4EA] dark:bg-[#232530] shrink-0" />

      {/* Tags Button matching Figma */}
      <button
        type="button"
        onClick={onOpenTagsModal}
        className={`flex-1 md:w-[80px] md:flex-initial py-1.5 md:py-1 flex flex-col items-center justify-center gap-1 rounded-[4px] transition-colors cursor-pointer ${
          isTag
            ? 'bg-[#EBF1FF] dark:bg-[#2B303B] text-[#335CFF]'
            : 'bg-transparent text-[#525866] dark:text-[#99A0AE] hover:bg-[#F3F5F8] dark:hover:bg-[#232530]/60'
        }`}
      >
        <TagIcon className="w-5 h-5 md:w-5 md:h-5 shrink-0" />
        <span className="hidden md:block text-[12px] font-normal leading-none tracking-tight">Tags</span>
      </button>

      {/* Divider */}
      <div className="hidden md:block w-px h-6 bg-[#E0E4EA] dark:bg-[#232530] shrink-0" />

      {/* Folders Button (Settings lives in the top bar gear icon) */}
      <button
        type="button"
        onClick={onOpenFoldersModal}
        className={`flex-1 md:w-[80px] md:flex-initial py-1.5 md:py-1 flex flex-col items-center justify-center gap-1 rounded-[4px] transition-colors cursor-pointer ${
          isFolder
            ? 'bg-[#EBF1FF] dark:bg-[#2B303B] text-[#335CFF]'
            : 'bg-transparent text-[#525866] dark:text-[#99A0AE] hover:bg-[#F3F5F8] dark:hover:bg-[#232530]/60'
        }`}
      >
        <FolderIcon className="w-5 h-5 md:w-5 md:h-5 shrink-0" />
        <span className="hidden md:block text-[12px] font-normal leading-none tracking-tight">Folders</span>
      </button>
    </nav>
  );
};
