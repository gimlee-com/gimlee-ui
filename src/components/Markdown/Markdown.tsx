import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import UIkit from 'uikit';
import { useTranslation } from 'react-i18next';
import { Image } from '../Image/Image';

interface MarkdownProps {
  content: string;
  className?: string;
}

const API_URL = import.meta.env.VITE_API_URL || '';

export const Markdown: React.FC<MarkdownProps> = React.memo(({ content, className }) => {
  const { t } = useTranslation();

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    // If it's an external link (not starting with app origin or API_URL)
    const isExternal = href.startsWith('http') && 
                     !href.startsWith(window.location.origin) && 
                     !(API_URL && href.startsWith(API_URL));

    if (isExternal) {
      e.preventDefault();
      UIkit.modal.confirm(t('common.externalLinkWarning'), { 
        stack: true,
        i18n: {
          ok: t('common.ok'),
          cancel: t('common.cancel')
        }
      }).then(
        () => {
          window.open(href, '_blank', 'noopener,noreferrer');
        },
        () => {
          // Cancelled - do nothing
        }
      );
    }
  };

  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ node: _node, ...props }) => {
            const href = props.href || '';
            const isExternal = href.startsWith('http') && 
                             !href.startsWith(window.location.origin) && 
                             !(API_URL && href.startsWith(API_URL));
            return (
              <a
                {...props}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
                onClick={(e) => handleLinkClick(e, props.href || '')}
              >
                {props.children}
                {isExternal && (
                  <span uk-icon="icon: pull; ratio: 0.8" className="uk-margin-small-left"></span>
                )}
              </a>
            );
          },
          img: ({ node: _node, ...props }) => {
            // Only allow images from our API or relative paths
            const src = props.src || '';
            const isSafe = src.startsWith('/') || src.startsWith('blob:') || (API_URL && src.startsWith(API_URL));
            
            if (isSafe) {
              return <Image {...(props as React.ImgHTMLAttributes<HTMLImageElement>)} className="uk-responsive-width" alt={props.alt || ''} />;
            }
            return (
              <span className="uk-text-muted uk-text-italic uk-text-small">
                [{t('ads.imageProhibited')}]
              </span>
            );
          },
          // Ensure tables have UIkit classes
          table: ({ node: _node, ...props }) => (
            <div className="uk-overflow-auto uk-margin">
              <table {...props} className="uk-table uk-table-divider uk-table-small" />
            </div>
          ),
          // Ensure lists have UIkit margins
          ul: ({ node: _node, ...props }) => <ul {...props} className="uk-list uk-list-bullet" />,
          ol: ({ node: _node, ...props }) => <ol {...props} className="uk-list uk-list-decimal" />,
          // Headers
          h1: ({ node: _node, ...props }) => <h1 {...props} className="uk-h3" />,
          h2: ({ node: _node, ...props }) => <h2 {...props} className="uk-h4" />,
          h3: ({ node: _node, ...props }) => <h3 {...props} className="uk-h5" />,
          // Blockquote
          blockquote: ({ node: _node, ...props }) => (
            <blockquote {...props} className="uk-text-muted uk-margin-left" style={{ borderLeft: '3px solid #e5e5e5', paddingLeft: '1em' }} />
          )
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
});
