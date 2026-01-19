'use client';

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import {
  SlashCommandGroup,
  SlashCommandItem,
} from '@/shared/components/editor/types';
import { filterSlashCommands } from '@/shared/components/editor/utils';
import { cn } from '@/shared/lib';
import { Editor, Range } from '@tiptap/react';
import {
  Code2,
  ExternalLink,
  Heading1,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Link,
  List,
  ListChecks,
  ListOrdered,
  Minus,
  Quote,
  Type,
  Video,
} from 'lucide-react';

type SlashCommandMenuProps = {
  editor: Editor;
  range: Range;
  query: string;
  onClose: () => void;
};

export const SlashCommandMenu = ({
  editor,
  range,
  query,
  onClose,
}: SlashCommandMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [filteredGroups, setFilteredGroups] = useState<SlashCommandGroup[]>([]);

  // 필터링된 모든 아이템을 flat하게
  const flatItems = filteredGroups.flatMap((group) => group.items);

  useEffect(() => {
    setFilteredGroups(filterSlashCommands(query));
    setSelectedIndex(0);
  }, [query]);

  const selectItem = useCallback(
    (item: SlashCommandItem) => {
      // 슬래시 커맨드 텍스트 삭제
      editor.chain().focus().deleteRange(range).run();
      // 커맨드 실행
      item.command(editor);
      onClose();
    },
    [editor, range, onClose]
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (flatItems.length === 0) return;

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setSelectedIndex(
          (prev) => (prev - 1 + flatItems.length) % flatItems.length
        );
        return true;
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % flatItems.length);
        return true;
      }

      if (event.key === 'Enter') {
        event.preventDefault();
        const selectedItem = flatItems[selectedIndex];
        if (selectedItem) {
          selectItem(selectedItem);
        }
        return true;
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return true;
      }

      return false;
    },
    [flatItems, selectedIndex, selectItem, onClose]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // 선택된 아이템이 보이도록 스크롤
  useLayoutEffect(() => {
    const menu = menuRef.current;
    if (!menu) return;

    const selectedElement = menu.querySelector('[data-selected="true"]');
    if (selectedElement) {
      selectedElement.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  if (flatItems.length === 0) {
    return (
      <div
        ref={menuRef}
        className={cn(
          'bg-gray-scale-white dark:bg-gray-scale-gray-90 border-line-line2 dark:border-gray-scale-gray-70',
          'z-50 w-[280px] overflow-hidden rounded-lg border shadow-lg'
        )}
      >
        <div className="text-text-sub dark:text-gray-scale-gray-40 px-4 py-3 text-sm">
          검색 결과가 없습니다
        </div>
      </div>
    );
  }

  let itemIndex = 0;

  return (
    <div
      ref={menuRef}
      className={cn(
        'bg-gray-scale-white dark:bg-gray-scale-gray-90 border-line-line2 dark:border-gray-scale-gray-70',
        'z-50 max-h-[320px] w-[280px] overflow-y-auto rounded-lg border shadow-lg'
      )}
    >
      {filteredGroups.map((group) => (
        <div key={group.title}>
          <div className="text-text-sub dark:text-gray-scale-gray-40 px-3 py-2 text-xs font-medium">
            {group.title}
          </div>
          {group.items.map((item) => {
            const currentIndex = itemIndex++;
            const isSelected = currentIndex === selectedIndex;

            return (
              <button
                key={item.id}
                type="button"
                data-selected={isSelected}
                className={cn(
                  'flex w-full items-center gap-3 px-3 py-2 text-left transition-colors',
                  'hover:bg-background-gray dark:hover:bg-gray-scale-gray-80',
                  isSelected && 'bg-background-gray dark:bg-gray-scale-gray-80'
                )}
                onClick={() => selectItem(item)}
              >
                <div
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-md',
                    'bg-background-gray dark:bg-gray-scale-gray-70',
                    'text-text-main dark:text-gray-scale-white'
                  )}
                >
                  <SlashCommandIcon icon={item.icon} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-text-main dark:text-gray-scale-white text-sm font-medium">
                    {item.title}
                  </div>
                  <div className="text-text-sub dark:text-gray-scale-gray-40 truncate text-xs">
                    {item.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
};

// 아이콘 컴포넌트
const SlashCommandIcon = ({ icon }: { icon: string }) => {
  const iconMap: Record<string, React.ReactNode> = {
    text: <Type size={20} />,
    heading1: <Heading1 size={20} />,
    heading2: <Heading2 size={20} />,
    heading3: <Heading3 size={20} />,
    bulletList: <List size={20} />,
    numberedList: <ListOrdered size={20} />,
    taskList: <ListChecks size={20} />,
    image: <ImageIcon size={20} />,
    link: <Link size={20} />,
    code: <Code2 size={20} />,
    quote: <Quote size={20} />,
    divider: <Minus size={20} />,
    video: <Video size={20} />,
    externalLink: <ExternalLink size={20} />,
  };

  return <>{iconMap[icon] || <Type size={20} />}</>;
};
