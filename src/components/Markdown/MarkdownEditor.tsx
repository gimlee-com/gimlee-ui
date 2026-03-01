import React, { forwardRef, useEffect, useRef } from 'react';
import { Milkdown, MilkdownProvider, useEditor, useInstance } from '@milkdown/react';
import { Editor, rootCtx, defaultValueCtx, editorViewCtx, parserCtx, commandsCtx } from '@milkdown/core';
import type { CmdKey } from '@milkdown/core';
import { Ctx } from '@milkdown/ctx';
import { gfm } from '@milkdown/preset-gfm';
import { 
  commonmark, 
  toggleStrongCommand, 
  toggleEmphasisCommand, 
  wrapInHeadingCommand, 
  toggleLinkCommand,
  insertImageCommand
} from '@milkdown/preset-commonmark';
import { history } from '@milkdown/plugin-history';
import { indent } from '@milkdown/plugin-indent';
import { trailing } from '@milkdown/plugin-trailing';
import { listener, listenerCtx } from '@milkdown/plugin-listener';
import { upload, uploadConfig } from '@milkdown/plugin-upload';
import type { Node } from '@milkdown/prose/model';
import { Decoration } from '@milkdown/prose/view';
import { nord } from '@milkdown/theme-nord';
import { useTranslation } from 'react-i18next';
import { apiClient } from '../../services/apiClient';
import type { MediaUploadResponseDto } from '../../types/api';
import styles from './MarkdownEditor.module.scss';

const API_URL = import.meta.env.VITE_API_URL || '';

interface MarkdownEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  status?: 'danger' | 'success';
  disabled?: boolean;
}

const Toolbar: React.FC = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = React.useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editorLoading, getEditor] = useInstance();

  const call = <T,>(command: { key: CmdKey<T> }, payload?: T) => {
    if (editorLoading) return;
    const editor = getEditor();
    if (editor) {
      editor.action((ctx: Ctx) => {
        ctx.get(commandsCtx).call(command.key, payload);
      });
    }
  };

  const onImageClick = () => {
    fileInputRef.current?.click();
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const response = await apiClient.post<MediaUploadResponseDto>('/media/upload/single', file);
      call(insertImageCommand, {
        src: `${API_URL}/api/media?p=${response.mdThumbPath}`,
        alt: file.name
      });
    } catch (error) {
      console.error('Failed to upload image from toolbar:', error);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
      setLoading(false);
    }
  };

  const onLinkClick = () => {
    const url = window.prompt(t('ads.markdown.linkPrompt'), 'https://');
    if (url) {
      call(toggleLinkCommand, { href: url });
    }
  };

  return (
    <div className={styles.toolbar}>
      <button type="button" onClick={() => call(toggleStrongCommand)} title={t('ads.markdown.bold')}>
        <span uk-icon="bold"></span>
      </button>
      <button type="button" onClick={() => call(toggleEmphasisCommand)} title={t('ads.markdown.italic')}>
        <span uk-icon="italic"></span>
      </button>
      <div className={styles.divider} />
      <button type="button" onClick={() => call(wrapInHeadingCommand, 1)} title={`${t('ads.markdown.heading')} 1`}>H1</button>
      <button type="button" onClick={() => call(wrapInHeadingCommand, 2)} title={`${t('ads.markdown.heading')} 2`}>H2</button>
      <button type="button" onClick={() => call(wrapInHeadingCommand, 3)} title={`${t('ads.markdown.heading')} 3`}>H3</button>
      <div className={styles.divider} />
      <button type="button" onClick={onLinkClick} title={t('ads.markdown.link')}>
        <span uk-icon="link"></span>
      </button>
      <button type="button" onClick={onImageClick} title={t('ads.markdown.image')} disabled={loading}>
        <span uk-icon="image"></span>
      </button>
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        accept="image/*" 
        onChange={onFileChange} 
      />
    </div>
  );
};

const EditorComponent: React.FC<MarkdownEditorProps> = ({ value, onChange, onBlur, onFocus, status, disabled }) => {
  const onChangeRef = useRef(onChange);
  const onBlurRef = useRef(onBlur);
  const onFocusRef = useRef(onFocus);
  const contentRef = useRef(value || '');

  useEffect(() => {
    onChangeRef.current = onChange;
    onBlurRef.current = onBlur;
    onFocusRef.current = onFocus;
  }, [onChange, onBlur, onFocus]);

  const { get: getEditor } = useEditor((root) => {
    return Editor.make()
      .config((ctx) => {
        ctx.set(rootCtx, root);
        ctx.set(defaultValueCtx, value || '');
        ctx.get(listenerCtx)
          .markdownUpdated((_ctx, markdown, prevMarkdown) => {
            if (markdown !== prevMarkdown) {
              contentRef.current = markdown;
              onChangeRef.current?.(markdown);
            }
          })
          .focus(() => {
            onFocusRef.current?.();
          })
          .blur(() => {
            onBlurRef.current?.();
          });
        
        ctx.set(uploadConfig.key, {
          enableHtmlFileUploader: false,
          uploadWidgetFactory: (pos, spec) => {
            const widgetDOM = document.createElement('span');
            widgetDOM.textContent = 'Upload in progress...';
            // @ts-expect-error -- Decoration.widget typing mismatch with prosemirror-upload
            return Decoration.widget(pos, widgetDOM, spec);
          },
          uploader: async (files, schema) => {
            const { image } = schema.nodes;
            if (!image) return [];

            const images: File[] = [];
            for (let i = 0; i < files.length; i++) {
              const file = files.item(i);
              if (file && file.type.includes('image')) {
                images.push(file);
              }
            }
            
            try {
              const results = await Promise.all(
                images.map(async (img) => {
                  const response = await apiClient.post<MediaUploadResponseDto>('/media/upload/single', img);
                  return image.createAndFill({
                    src: `${API_URL}/api/media?p=${response.mdThumbPath}`,
                    alt: img.name,
                  });
                })
              );
              return results.filter((n): n is Node => !!n);
            } catch (error) {
              console.error('Failed to upload images in MarkdownEditor:', error);
              return [];
            }
          }
        });
      })
      .config(nord)
      .use(commonmark)
      .use(gfm)
      .use(history)
      .use(indent)
      .use(trailing)
      .use(listener)
      .use(upload);
  }, []);

  useEffect(() => {
    if (value !== undefined && value !== contentRef.current) {
      const editor = getEditor();
      if (editor) {
        editor.action((ctx) => {
          const view = ctx.get(editorViewCtx);
          const parser = ctx.get(parserCtx);
          const doc = parser(value);
          if (!doc) return;
          const state = view.state;
          view.dispatch(state.tr.replaceWith(0, state.doc.content.size, doc));
          contentRef.current = value;
        });
      }
    }
  }, [value, getEditor]);

  const containerClasses = [
    styles.editorContainer,
    status === 'danger' ? styles.danger : '',
    disabled ? styles.disabled : ''
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      {!disabled && <Toolbar />}
      <Milkdown />
    </div>
  );
};

export const MarkdownEditor = forwardRef<HTMLDivElement, MarkdownEditorProps>((props, ref) => {
  return (
    <div ref={ref}>
      <MilkdownProvider>
        <EditorComponent {...props} />
      </MilkdownProvider>
    </div>
  );
});

MarkdownEditor.displayName = 'MarkdownEditor';
