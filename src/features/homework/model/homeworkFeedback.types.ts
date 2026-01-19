export interface HomeworkFeedback {
  content: string;
  resolvedContent?: { content: string };
  modifiedFeedbackAt: string;
}
