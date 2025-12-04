import { Editor, Extension } from '@tiptap/core';

export interface KeyboardShortcutsOptions {
  onLinkShortcut?: () => void;
}

export const KeyboardShortcuts = Extension.create<KeyboardShortcutsOptions>({
  name: 'keyboardShortcuts',

  addOptions() {
    return {
      onLinkShortcut: undefined,
    };
  },

  addKeyboardShortcuts() {
    const LIST_ITEM_TYPES = ['taskItem', 'listItem'] as const;

    // 헬퍼 함수 추출
    const findActiveListItemType = (editor: Editor): string | null => {
      for (const type of LIST_ITEM_TYPES) {
        if (editor.isActive(type)) {
          return type;
        }
      }
      return null;
    };

    return {
      // Ctrl+K: 링크 추가
      'Mod-k': () => {
        const { selection } = this.editor.state;
        const hasSelection = !selection.empty;

        if (hasSelection) {
          // 선택된 텍스트가 있으면 링크 입력 UI를 열도록 콜백 호출
          this.options.onLinkShortcut?.();
          return true;
        }

        // 선택된 텍스트가 없으면 기본 동작
        return false;
      },
      // Tab: 들여쓰기
      Tab: () => {
        const activeType = findActiveListItemType(this.editor);
        if (activeType) {
          return this.editor.commands.sinkListItem(activeType);
        }
        // 일반 텍스트에서는 탭 문자 또는 공백 삽입
        // 브라우저 기본 동작 방지를 위해 true 반환
        return this.editor.commands.insertContent('\t');
      },
      // Shift+Tab: 내어쓰기
      'Shift-Tab': () => {
        const activeType = findActiveListItemType(this.editor);
        if (activeType) {
          return this.editor.commands.liftListItem(activeType);
        }
        // 일반 텍스트에서는 브라우저 기본 동작 방지만
        return true;
      },
    };
  },
});
