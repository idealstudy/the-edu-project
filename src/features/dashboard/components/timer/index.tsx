'use client';

import { useEffect, useRef, useState } from 'react';

import { initialTextEditorValue } from '@/shared/components/editor';
import type { TextEditorValue } from '@/shared/components/editor';
import { Dialog } from '@/shared/components/ui/dialog';
import { cn } from '@/shared/lib';

import { CompleteView } from './complete-view';
import { RunningView } from './running-view';
import { SetupView } from './setup-view';

type Step = 'setup' | 'running' | 'complete';

type TimerModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const TimerModal = ({ isOpen, onClose }: TimerModalProps) => {
  const [step, setStep] = useState<Step>('setup');
  const [topic, setTopic] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [noteOpen, setNoteOpen] = useState(true);
  const [noteContent, setNoteContent] = useState<TextEditorValue>(
    initialTextEditorValue
  );
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => setElapsed((t) => t + 1), 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const handleClose = () => {
    setStep('setup');
    setTopic('');
    setSelectedSubject(null);
    setElapsed(0);
    setIsRunning(false);
    setNoteOpen(true);
    setNoteContent(initialTextEditorValue);
    onClose();
  };

  const today = new Date();
  const dateStr = `${today.getFullYear()}. ${String(today.getMonth() + 1).padStart(2, '0')}. ${String(today.getDate()).padStart(2, '0')}`;

  return (
    <Dialog
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <Dialog.Content
        className={cn(step === 'running' ? 'max-w-[680px]' : 'max-w-[500px]')}
      >
        {step === 'setup' && (
          <SetupView
            topic={topic}
            onTopicChange={setTopic}
            selectedSubject={selectedSubject}
            onSubjectChange={setSelectedSubject}
            canStart={topic.trim().length > 0 || selectedSubject !== null}
            onStart={() => {
              setElapsed(0);
              setIsRunning(true);
              setStep('running');
            }}
            onClose={handleClose}
          />
        )}
        {step === 'running' && (
          <RunningView
            elapsed={elapsed}
            isRunning={isRunning}
            subject={selectedSubject}
            noteOpen={noteOpen}
            noteContent={noteContent}
            onNoteContentChange={setNoteContent}
            onToggleNote={() => setNoteOpen((o) => !o)}
            onPauseResume={() => setIsRunning((r) => !r)}
            onReset={() => {
              setElapsed(0);
              setIsRunning(true);
            }}
            onFinish={() => {
              setIsRunning(false);
              setStep('complete');
            }}
            onBack={() => {
              setIsRunning(false);
              setStep('setup');
            }}
          />
        )}
        {step === 'complete' && (
          <CompleteView
            elapsed={elapsed}
            subject={selectedSubject}
            dateStr={dateStr}
            onClose={handleClose}
            onWriteNote={handleClose}
          />
        )}
      </Dialog.Content>
    </Dialog>
  );
};
