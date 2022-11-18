import { Injectable } from '@nestjs/common';
import { populatedAnswer } from 'src/answer/domain/entities/answer.model';
import { isBefore, isAfter } from 'date-fns';

@Injectable()
export class Helpers {
  selectAnswersForExam(answers: populatedAnswer[], amount: number) {
    const randomAmount = Math.floor(amount * (20 / 100));
    const { correctAnswers, newAnswers, randomAnswers, wrongAnswers } =
      this.sortAnswers([...answers], randomAmount);

    if (newAnswers.length && wrongAnswers.length && correctAnswers.length) {
      const answers = this.allHaveAnswers({
        amount,
        correctAnswers,
        newAnswers,
        randomAnswers,
        wrongAnswers,
      });
      return answers;
    }

    switch (newAnswers.length) {
      case answers.length - randomAmount: // All answers are new
        return [
          ...randomAnswers,
          ...newAnswers.slice(0, amount - randomAmount - 1),
        ];
      case 0:
        return this.noNewAnswers({
          amount,
          correctAnswers,
          randomAnswers,
          wrongAnswers,
        });
      default:
        break;
    }

    switch (wrongAnswers.length) {
      case answers.length - randomAmount: // All answers are wrong
        return [
          ...randomAnswers,
          ...wrongAnswers.slice(0, amount - randomAmount - 1),
        ];
      case 0:
        return this.nowrongAnswers({
          amount,
          correctAnswers,
          randomAnswers,
          newAnswers,
        });
      default:
        break;
    }

    switch (correctAnswers.length) {
      case answers.length - randomAmount: // All answers are correct
        return [
          ...randomAnswers,
          ...correctAnswers.slice(0, amount - randomAmount - 1),
        ];
      case 0:
        return this.noCorrectAnswers({
          amount,
          newAnswers,
          randomAnswers,
          wrongAnswers,
        });
      default:
        break;
    }
  }

  private sortAnswers(answers: populatedAnswer[], randomAmount: number) {
    const correctAnswers = [];
    const wrongAnswers = [];
    const newAnswers = [];

    const answersToSort = [...answers];
    const randomAnswers = [];

    [...Array(randomAmount)].forEach(() => {
      randomAnswers.push(
        answersToSort.splice(Math.random() * answersToSort.length, 1)[0],
      );
    });

    answersToSort.forEach((answer) => {
      if (answer.stats.answers === 0) {
        newAnswers.push(answer);
        return;
      }
      answer.last_answer.correct
        ? correctAnswers.push(answer)
        : wrongAnswers.push(answer);
      return;
    });

    correctAnswers.sort((a: populatedAnswer, z: populatedAnswer) => {
      return +isBefore(
        new Date(a.last_answer.date),
        new Date(z.last_answer.date),
      );
    });

    wrongAnswers.sort((a: populatedAnswer, z: populatedAnswer) => {
      return +isAfter(
        new Date(a.last_answer.date),
        new Date(z.last_answer.date),
      );
    });

    return { correctAnswers, wrongAnswers, newAnswers, randomAnswers };
  }

  private allHaveAnswers({
    randomAnswers,
    correctAnswers,
    wrongAnswers,
    newAnswers,
    amount,
  }: {
    randomAnswers: populatedAnswer[];
    wrongAnswers: populatedAnswer[];
    correctAnswers: populatedAnswer[];
    newAnswers: populatedAnswer[];
    amount: number;
  }) {
    const wrongAnswerAmount = amount * (40 / 100);
    const correctAnswerAmount = amount * (20 / 100);
    const newAnswerAmount = amount * (20 / 100);

    if (wrongAnswers.length < wrongAnswerAmount) {
      return correctAnswers.length < correctAnswerAmount
        ? [
            ...randomAnswers,
            ...wrongAnswers,
            ...correctAnswers,
            ...newAnswers.slice(
              0,
              amount - correctAnswers.length - wrongAnswers.length - 1,
            ),
          ]
        : [
            ...randomAnswers,
            ...wrongAnswers,
            ...correctAnswers.slice(0, correctAnswerAmount - 1),
            ...newAnswers.slice(
              0,
              amount - wrongAnswers.length - correctAnswerAmount - 1,
            ),
          ];
    }

    if (correctAnswers.length < correctAnswerAmount) {
      return wrongAnswers.length < wrongAnswerAmount
        ? [
            ...randomAnswers,
            ...correctAnswers,
            ...wrongAnswers,
            ...newAnswers.slice(
              0,
              amount - correctAnswers.length - wrongAnswers.length - 1,
            ),
          ]
        : [
            ...randomAnswers,
            ...correctAnswers,
            ...wrongAnswers.slice(0, wrongAnswerAmount - 1),
            ...newAnswers.slice(
              0,
              amount - correctAnswers.length - wrongAnswerAmount - 1,
            ),
          ];
    }

    if (newAnswers.length < newAnswerAmount) {
      return correctAnswers.length < correctAnswerAmount
        ? [
            ...randomAnswers,
            ...correctAnswers,
            ...newAnswers,
            ...wrongAnswers.slice(
              0,
              amount - newAnswers.length - correctAnswers.length - 1,
            ),
          ]
        : [
            ...randomAnswers,
            ...newAnswers,
            ...correctAnswers.slice(0, correctAnswerAmount - 1),
            ...wrongAnswers.slice(
              0,
              amount - newAnswers.length - wrongAnswerAmount - 1,
            ),
          ];
    }

    return [
      ...randomAnswers,
      ...correctAnswers.slice(0, correctAnswerAmount - 1),
      ...wrongAnswers.slice(0, wrongAnswerAmount - 1),
      ...newAnswers.slice(0, newAnswerAmount - 1),
    ];
  }

  private noNewAnswers({
    randomAnswers,
    correctAnswers,
    wrongAnswers,
    amount,
  }: {
    randomAnswers: populatedAnswer[];
    wrongAnswers: populatedAnswer[];
    correctAnswers: populatedAnswer[];
    amount: number;
  }) {
    const wrongAnswerAmount = amount * (50 / 100);
    const correctAnswerAmount = amount * (30 / 100);
    let remainingAnswers: populatedAnswer[];

    if (correctAnswers.length < correctAnswerAmount) {
      remainingAnswers = [
        ...correctAnswers,
        ...wrongAnswers.slice(
          0,
          correctAnswerAmount - correctAnswers.length - 1,
        ),
      ];
      return [...randomAnswers, ...remainingAnswers];
    }

    if (wrongAnswers.length < wrongAnswerAmount) {
      remainingAnswers = [
        ...wrongAnswers,
        ...correctAnswers.slice(0, wrongAnswerAmount - wrongAnswers.length - 1),
      ];
      return [...randomAnswers, ...remainingAnswers];
    }

    remainingAnswers = [
      ...wrongAnswers.slice(0, wrongAnswerAmount - 1),
      ...correctAnswers.slice(0, correctAnswerAmount - 1),
    ];

    return [...randomAnswers, ...remainingAnswers];
  }

  private noCorrectAnswers({
    randomAnswers,
    newAnswers,
    wrongAnswers,
    amount,
  }: {
    randomAnswers: populatedAnswer[];
    wrongAnswers: populatedAnswer[];
    newAnswers: populatedAnswer[];
    amount: number;
  }) {
    const wrongAnswerAmount = amount * (40 / 100);
    const newAnswerAmount = amount * (30 / 100);
    let remainingAnswers: populatedAnswer[];

    if (newAnswers.length < newAnswerAmount) {
      remainingAnswers = [
        ...newAnswers,
        ...wrongAnswers.slice(0, newAnswerAmount - newAnswers.length - 1),
      ];
      return [...randomAnswers, ...remainingAnswers];
    }

    if (wrongAnswers.length < wrongAnswerAmount) {
      remainingAnswers = [
        ...wrongAnswers,
        ...newAnswers.slice(0, wrongAnswerAmount - wrongAnswers.length - 1),
      ];
      return [...randomAnswers, ...remainingAnswers];
    }

    remainingAnswers = [
      ...wrongAnswers.slice(0, wrongAnswerAmount - 1),
      ...newAnswers.slice(0, newAnswerAmount - 1),
    ];

    return [...randomAnswers, ...remainingAnswers];
  }

  private nowrongAnswers({
    randomAnswers,
    newAnswers,
    correctAnswers,
    amount,
  }: {
    randomAnswers: populatedAnswer[];
    correctAnswers: populatedAnswer[];
    newAnswers: populatedAnswer[];
    amount: number;
  }) {
    const correctAnswerAmount = amount * (20 / 100);
    const newAnswerAmount = amount * (60 / 100);
    let remainingAnswers: populatedAnswer[];

    if (newAnswers.length < newAnswerAmount) {
      remainingAnswers = [
        ...newAnswers,
        ...correctAnswers.slice(0, newAnswerAmount - newAnswers.length - 1),
      ];
      return [...randomAnswers, ...remainingAnswers];
    }

    if (correctAnswers.length < correctAnswerAmount) {
      remainingAnswers = [
        ...correctAnswers,
        ...newAnswers.slice(0, correctAnswerAmount - correctAnswers.length - 1),
      ];
      return [...randomAnswers, ...remainingAnswers];
    }

    remainingAnswers = [
      ...correctAnswers.slice(0, correctAnswerAmount - 1),
      ...newAnswers.slice(0, newAnswerAmount - 1),
    ];

    return [...randomAnswers, ...remainingAnswers];
  }
}
