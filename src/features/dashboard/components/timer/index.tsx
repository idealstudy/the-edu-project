'use client';

import { useEffect, useRef, useState } from 'react';

import {
  useStudyNoteTimerFinish,
  useStudyNoteTimerPause,
  useStudyNoteTimerProgress,
  useStudyNoteTimerResume,
  useStudyNoteTimerStart,
  useStudyNoteTimerTempSave,
} from '@/features/dashboard/hooks';
import {
  initialTextEditorValue,
  prepareContentForSave,
} from '@/shared/components/editor';
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
  const [studyNoteId, setStudyNoteId] = useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data: progressData } = useStudyNoteTimerProgress({ enabled: isOpen });
  const { mutate: startTimer } = useStudyNoteTimerStart();
  const { mutate: pauseTimer } = useStudyNoteTimerPause();
  const { mutate: resumeTimer } = useStudyNoteTimerResume();
  const { mutate: finishTimer } = useStudyNoteTimerFinish();
  const { mutate: tempSaveTimer } = useStudyNoteTimerTempSave();

  useEffect(() => {
    if (!isOpen || !progressData?.ongoing) return;
    setStudyNoteId(progressData.id);
    setTopic(progressData.title);
    setSelectedSubject(progressData.subject);
    setElapsed(progressData.studyTime);
    setIsRunning(progressData.status === 'RUNNING');
    setStep('running');
  }, [isOpen, progressData]);

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
    setStudyNoteId(null);
    onClose();
  };

  const handlePauseResume = () => {
    if (!studyNoteId) return;
    if (isRunning) {
      pauseTimer(
        {
          studyNoteId,
          body: {
            title: topic,
            subject: selectedSubject ?? '',
            content: '',
            mediaIds: [],
            finishTimestamp: new Date().toISOString(),
          },
        },
        { onSuccess: () => setIsRunning(false) }
      );
    } else {
      resumeTimer(studyNoteId, { onSuccess: () => setIsRunning(true) });
    }
  };

  const handleTempSave = () => {
    if (!studyNoteId) return;
    const { contentString, mediaIds } = prepareContentForSave(noteContent);
    tempSaveTimer({
      studyNoteId,
      body: {
        title: topic,
        subject: selectedSubject ?? '',
        content: contentString,
        mediaIds,
        finishTimestamp: new Date().toISOString(),
      },
    });
  };

  const handleFinish = () => {
    if (!studyNoteId) return;
    const { contentString, mediaIds } = prepareContentForSave(noteContent);
    finishTimer(
      {
        studyNoteId,
        body: {
          title: topic,
          subject: selectedSubject ?? '',
          content: contentString,
          mediaIds,
          finishTimestamp: new Date().toISOString(),
        },
      },
      {
        onSuccess: () => {
          setIsRunning(false);
          setStep('complete');
        },
      }
    );
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
        <Dialog.Title className="sr-only">
          {step === 'setup'
            ? '타이머'
            : step === 'running'
              ? '타이머 진행 중'
              : '공부 완료'}
        </Dialog.Title>
        {step === 'setup' && (
          <SetupView
            topic={topic}
            onTopicChange={setTopic}
            selectedSubject={selectedSubject}
            onSubjectChange={setSelectedSubject}
            canStart={topic.trim().length > 0 || selectedSubject !== null}
            onStart={() => {
              startTimer(
                {
                  title: topic,
                  subject: selectedSubject ?? '',
                  content: '',
                  mediaIds: [],
                  finishTimestamp: new Date().toISOString(),
                },
                {
                  onSuccess: ({ id }) => {
                    setStudyNoteId(id);
                    setElapsed(0);
                    setIsRunning(true);
                    setStep('running');
                  },
                }
              );
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
            onPauseResume={handlePauseResume}
            onTempSave={handleTempSave}
            onReset={() => {
              setElapsed(0);
              setIsRunning(true);
            }}
            onFinish={handleFinish}
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
