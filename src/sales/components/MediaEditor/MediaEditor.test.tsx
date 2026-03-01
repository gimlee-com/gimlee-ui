import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MediaEditor } from './MediaEditor';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../../i18n';

// Mock react-easy-crop
vi.mock('react-easy-crop', () => {
  return {
    default: ({ onCropChange, onZoomChange, onRotationChange, onInteractionEnd }: { onCropChange: (val: { x: number; y: number }) => void; onZoomChange: (val: number) => void; onRotationChange: (val: number) => void; onInteractionEnd: () => void }) => (
      <div data-testid="mock-cropper">
        <button onClick={() => onCropChange({ x: 10, y: 10 })}>Change Crop</button>
        <button onClick={() => onZoomChange(2)}>Change Zoom</button>
        <button onClick={() => onRotationChange(90)}>Change Rotation</button>
        <button onClick={onInteractionEnd}>Interaction End</button>
      </div>
    ),
  };
});

// Mock imageUtils
vi.mock('../../../utils/imageUtils', () => ({
  getCroppedImg: vi.fn(),
}));

// Mock useUIKit
vi.mock('../../../hooks/useUIkit', () => ({
  useUIKit: () => ({
    ref: { current: document.createElement('div') },
    instance: {
      show: vi.fn(),
      hide: vi.fn(),
    },
  }),
}));

const renderMediaEditor = () => {
  return render(
    <I18nextProvider i18n={i18n}>
      <MediaEditor
        imageSrc="test-image.jpg"
        onSave={vi.fn()}
        onCancel={vi.fn()}
      />
    </I18nextProvider>
  );
};

describe('MediaEditor Undo/Redo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should enable undo after an interaction', async () => {
    renderMediaEditor();
    
    // Undo should be disabled initially
    const undoButton = screen.getByTitle(/undo/i);
    expect(undoButton).toBeDisabled();

    // Perform interaction
    const changeCropBtn = screen.getByText('Change Crop');
    fireEvent.click(changeCropBtn);
    
    const interactionEndBtn = screen.getByText('Interaction End');
    fireEvent.click(interactionEndBtn);

    // Undo should now be enabled
    expect(undoButton).not.toBeDisabled();
  });

  it('should undo and redo correctly', async () => {
    renderMediaEditor();
    
    const undoButton = screen.getByTitle(/undo/i);
    const redoButton = screen.getByTitle(/redo/i);
    
    // 1. Initial state (Undo: disabled, Redo: disabled)
    expect(undoButton).toBeDisabled();
    expect(redoButton).toBeDisabled();

    // 2. Interaction (Rotate)
    const rotateBtn = screen.getByTitle(/rotate/i);
    fireEvent.click(rotateBtn);

    // Undo should be enabled
    expect(undoButton).not.toBeDisabled();
    expect(redoButton).toBeDisabled();

    // 3. Undo
    fireEvent.click(undoButton);
    expect(undoButton).toBeDisabled();
    expect(redoButton).not.toBeDisabled();

    // 4. Redo
    fireEvent.click(redoButton);
    expect(undoButton).not.toBeDisabled();
    expect(redoButton).toBeDisabled();
  });

  it('should NOT increment historyIndex if state is identical', async () => {
    renderMediaEditor();
    
    const undoButton = screen.getByTitle(/undo/i);
    
    // Initial state: historyIndex 0, history [S0]
    
    // Perform interaction
    fireEvent.click(screen.getByText('Change Crop'));
    fireEvent.click(screen.getByText('Interaction End')); 
    // Expect: historyIndex 1, history [S0, S1]

    // Perform same interaction again
    fireEvent.click(screen.getByText('Interaction End')); 
    // Expect: historyIndex 1, history [S0, S1] (because S1 is identical to S1)
    
    // Click undo
    fireEvent.click(undoButton); 
    // Expect: historyIndex 0. Undo button should be disabled.
    
    expect(undoButton).toBeDisabled();
  });
});
