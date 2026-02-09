/**
 * ExerciseRenderer – dispatches the correct exercise component based on type.
 */
import React from 'react';
import type { GrammarExercise } from '@/types/grammar';
import { MultipleChoiceExercise } from './MultipleChoiceExercise';
import { FillInTheBlankExercise } from './FillInTheBlankExercise';
import { TrueFalseExercise } from './TrueFalseExercise';

interface Props {
  exercise: GrammarExercise;
  onAnswer: (userAnswer: string, isCorrect: boolean) => void;
}

export const ExerciseRenderer: React.FC<Props> = ({ exercise, onAnswer }) => {
  switch (exercise.type) {
    case 'multiple_choice':
      return <MultipleChoiceExercise exercise={exercise} onAnswer={onAnswer} />;
    case 'fill_in_the_blank':
      return <FillInTheBlankExercise exercise={exercise} onAnswer={onAnswer} />;
    case 'true_false':
      return <TrueFalseExercise exercise={exercise} onAnswer={onAnswer} />;
    default:
      return null;
  }
};
