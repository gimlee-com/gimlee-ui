import React, { useState, useCallback, useEffect } from 'react';
import Cropper, { type Area } from 'react-easy-crop';
import { useTranslation } from 'react-i18next';
import UIkit from 'uikit';
import { Modal, ModalDialog, ModalHeader, ModalBody, ModalFooter, ModalTitle, ModalCloseDefault } from '../../../components/uikit/Modal/Modal';
import { Button } from '../../../components/uikit/Button/Button';
import { Grid } from '../../../components/uikit/Grid/Grid';
import { Spinner } from '../../../components/uikit/Spinner/Spinner';
import { useUIKit } from '../../../hooks/useUIkit';
import { getCroppedImg } from '../../../utils/imageUtils';
import styles from './MediaEditor.module.scss';

interface MediaEditorProps {
  id?: string;
  imageSrc: string;
  onSave: (blob: Blob) => void;
  onCancel: () => void;
}

interface Transformation {
  crop: { x: number; y: number };
  zoom: number;
  rotation: number;
  aspect: number | undefined;
  croppedAreaPixels: Area | null;
}

const ASPECTS = [
  { label: 'Free', value: undefined },
  { label: '1:1', value: 1 },
  { label: '4:3', value: 4 / 3 },
  { label: '16:9', value: 16 / 9 },
];

export const MediaEditor: React.FC<MediaEditorProps> = ({ id = 'media-editor', imageSrc, onSave, onCancel }) => {
  const { t } = useTranslation();
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [aspect, setAspect] = useState<number | undefined>(ASPECTS[1].value); // Default 1:1
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [loading, setLoading] = useState(false);

  const [historyState, setHistoryState] = useState<{
    items: Transformation[];
    index: number;
  }>({ items: [], index: -1 });

  const { items: history, index: historyIndex } = historyState;

  const { ref: modalRef, instance: modalInstance } = useUIKit<UIkit.UIkitModalElement, HTMLDivElement>('modal', {
    stack: true,
    container: false
  });

  useEffect(() => {
    const modalEl = modalRef.current;
    if (modalInstance && modalEl) {
      modalInstance.show();
      UIkit.util.on(modalEl, 'hidden', onCancel);
      return () => {
        UIkit.util.off(modalEl, 'hidden', onCancel);
      };
    }
  }, [modalInstance, onCancel, modalRef]);

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const pushToHistory = useCallback((state: Transformation) => {
    setHistoryState(prev => {
      const newItems = prev.items.slice(0, prev.index + 1);
      // Avoid pushing identical states
      const last = newItems[newItems.length - 1];
      if (last && 
          last.crop.x === state.crop.x && 
          last.crop.y === state.crop.y && 
          last.zoom === state.zoom && 
          last.rotation === state.rotation && 
          last.aspect === state.aspect) {
        return prev;
      }
      const updatedItems = [...newItems, state];
      return {
        items: updatedItems,
        index: updatedItems.length - 1
      };
    });
  }, []);

  // Initial history entry
  useEffect(() => {
    if (history.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- initializing history on first render
      pushToHistory({ crop: { x: 0, y: 0 }, zoom: 1, rotation: 0, aspect: ASPECTS[1].value, croppedAreaPixels: null });
    }
  }, [history.length, pushToHistory]);

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const prevState = history[newIndex];
      setHistoryState(prev => ({ ...prev, index: newIndex }));
      setCrop(prevState.crop);
      setZoom(prevState.zoom);
      setRotation(prevState.rotation);
      setAspect(prevState.aspect);
      setCroppedAreaPixels(prevState.croppedAreaPixels);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      const nextState = history[nextIndex];
      setHistoryState(prev => ({ ...prev, index: nextIndex }));
      setCrop(nextState.crop);
      setZoom(nextState.zoom);
      setRotation(nextState.rotation);
      setAspect(nextState.aspect);
      setCroppedAreaPixels(nextState.croppedAreaPixels);
    }
  };

  const commitChange = useCallback(() => {
    pushToHistory({ crop, zoom, rotation, aspect, croppedAreaPixels });
  }, [crop, zoom, rotation, aspect, croppedAreaPixels, pushToHistory]);

  const handleRotate = () => {
    const newRotation = (rotation + 90) % 360;
    setRotation(newRotation);
    // Committing rotation immediately
    pushToHistory({ crop, zoom, rotation: newRotation, aspect, croppedAreaPixels });
  };

  const handleSave = async () => {
    if (!croppedAreaPixels) return;
    setLoading(true);
    try {
      const blob = await getCroppedImg(imageSrc, croppedAreaPixels, rotation);
      if (blob) {
        onSave(blob);
        // Modal will be closed and onCancel will be called via 'hidden' event
        modalInstance?.hide();
      }
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  return (
    <Modal ref={modalRef} id={id} className={`${styles.modal} uk-modal-container`} bgClose={false}>
      <ModalDialog className="uk-width-5-6@m">
        <ModalHeader>
          <ModalTitle>{t('ads.editPhoto')}</ModalTitle>
          <ModalCloseDefault />
        </ModalHeader>
        <ModalBody>
          <Grid gap="collapse" divider match>
            <div className="uk-width-2-3@m">
              <div className={styles.editorContainer}>
                <div className={styles.cropWrapper}>
                  <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    rotation={rotation}
                    aspect={aspect}
                    onCropChange={setCrop}
                    onCropComplete={onCropComplete}
                    onZoomChange={setZoom}
                    onRotationChange={setRotation}
                    onInteractionEnd={commitChange}
                  />
                </div>
              </div>
            </div>

            <div className="uk-width-1-3@m">
              <div className={styles.controls}>
                <div className={styles.historyControls}>
                  <Button 
                    size="small" 
                    onClick={handleUndo} 
                    disabled={historyIndex <= 0}
                    uk-icon="icon: history"
                    title={t('common.undo')}
                    uk-tooltip={t('common.undo')}
                  />
                  <Button 
                    size="small" 
                    onClick={handleRedo} 
                    disabled={historyIndex >= history.length - 1}
                    uk-icon="icon: future"
                    title={t('common.redo')}
                    uk-tooltip={t('common.redo')}
                  />
                  <div className="uk-flex-1" />
                  <Button 
                    size="small" 
                    onClick={handleRotate}
                    uk-icon="icon: refresh"
                    title={t('common.rotate')}
                    uk-tooltip={t('common.rotate')}
                  />
                </div>

                <div className="uk-margin">
                  <label className="uk-form-label">{t('ads.aspectRatio')}</label>
                  <div className={styles.aspectRatios}>
                    {ASPECTS.map(a => (
                      <Button 
                        key={a.label}
                        size="small" 
                        variant={aspect === a.value ? 'primary' : 'default'}
                        onClick={() => {
                            setAspect(a.value);
                            pushToHistory({ crop, zoom, rotation, aspect: a.value, croppedAreaPixels });
                        }}
                      >
                        {a.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="uk-margin">
                  <label className="uk-form-label">{t('ads.zoom')}</label>
                  <input
                    type="range"
                    value={zoom}
                    min={1}
                    max={3}
                    step={0.1}
                    aria-labelledby="Zoom"
                    onChange={(e) => setZoom(Number(e.target.value))}
                    onMouseUp={commitChange}
                    className="uk-range"
                  />
                </div>
              </div>
            </div>
          </Grid>
        </ModalBody>
        <ModalFooter className="uk-text-right">
          <Button className="uk-margin-small-right" onClick={() => modalInstance?.hide()} disabled={loading}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={loading || !croppedAreaPixels}>
            {loading ? <Spinner ratio={0.5} /> : t('common.save')}
          </Button>
        </ModalFooter>
      </ModalDialog>
    </Modal>
  );
};
