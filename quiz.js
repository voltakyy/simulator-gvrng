/**
 * Praktikum Alpro GvRng — Interactive Quiz Controller
 * Features: Instant feedback, score calculation, code snippet rendering,
 * and explanation reveals.
 */

document.addEventListener('DOMContentLoaded', () => {
  const quizContainer = document.getElementById('quizContainer');
  const quizProgressFill = document.getElementById('quizProgressFill');
  const quizProgressText = document.getElementById('quizProgressText');
  const quizScoreCorrect = document.getElementById('quizScoreCorrect');
  const quizScoreWrong = document.getElementById('quizScoreWrong');
  const btnPrevQuestion = document.getElementById('btnPrevQuestion');
  const btnNextQuestion = document.getElementById('btnNextQuestion');
  const btnRestartQuiz = document.getElementById('btnRestartQuiz');

  if (!quizContainer) return;

  const questions = window.GVR_QUIZ_QUESTIONS || [];
  let currentIndex = 0;
  let userAnswers = new Map(); // questionId -> { selectedIndex, isCorrect }

  function updateQuizHeader() {
    const total = questions.length;
    const answeredCount = userAnswers.size;
    const pct = total > 0 ? Math.round((answeredCount / total) * 100) : 0;

    if (quizProgressFill) quizProgressFill.style.width = `${pct}%`;
    if (quizProgressText) quizProgressText.textContent = `Soal ${currentIndex + 1} dari ${total} (${pct}% Selesai)`;

    let correct = 0;
    let wrong = 0;
    userAnswers.forEach(ans => {
      if (ans.isCorrect) correct++;
      else wrong++;
    });

    if (quizScoreCorrect) quizScoreCorrect.textContent = correct.toString();
    if (quizScoreWrong) quizScoreWrong.textContent = wrong.toString();

    if (btnPrevQuestion) btnPrevQuestion.disabled = currentIndex === 0;
    if (btnNextQuestion) {
      if (currentIndex === total - 1) {
        btnNextQuestion.textContent = 'Selesai & Review';
      } else {
        btnNextQuestion.textContent = 'Soal Selanjutnya →';
      }
    }
  }

  function renderCurrentQuestion() {
    if (questions.length === 0) {
      quizContainer.innerHTML = '<p>Belum ada soal kuis yang dimuat.</p>';
      return;
    }

    const q = questions[currentIndex];
    const prevAnswer = userAnswers.get(q.id);

    let codeHtml = '';
    if (q.code) {
      const highlighted = q.code.split('\n').map(l => GvrInterpreter.highlightLine(l)).join('\n');
      codeHtml = `<pre class="question-code-block"><code>${highlighted}</code></pre>`;
    }

    let optionsHtml = q.options.map((opt, optIdx) => {
      const letter = String.fromCharCode(65 + optIdx); // A, B, C, D
      let btnClasses = 'quiz-option-btn';
      let disabled = '';

      if (prevAnswer) {
        disabled = 'disabled';
        if (opt.isCorrect) {
          btnClasses += ' correct';
        } else if (prevAnswer.selectedIndex === optIdx) {
          btnClasses += ' wrong';
        }
      }

      return `
        <button class="${btnClasses}" data-opt="${optIdx}" ${disabled}>
          <span class="option-letter">${letter}</span>
          <span class="option-text" style="white-space: pre-wrap;">${escapeHtml(opt.text)}</span>
        </button>
      `;
    }).join('');

    let feedbackHtml = '';
    if (prevAnswer) {
      const statusClass = prevAnswer.isCorrect ? 'correct' : 'wrong';
      const statusTitle = prevAnswer.isCorrect ? '✓ Jawaban Anda Benar!' : '✗ Jawaban Belum Tepat';
      feedbackHtml = `
        <div class="feedback-box ${statusClass}">
          <strong>${statusTitle}</strong>
          <p style="margin: 0.4rem 0 0; white-space: pre-line;">${escapeHtml(q.explanation)}</p>
        </div>
      `;
    }

    quizContainer.innerHTML = `
      <div class="quiz-question-card">
        <div class="question-meta">
          <span class="badge-blue" style="padding: 0.2rem 0.6rem; border-radius: 6px;">${q.bab}</span>
          <span>ID #${q.id}</span>
        </div>
        <h3 class="question-title">${q.title}</h3>
        <p style="color: var(--color-text); margin: 0 0 1rem; line-height: 1.6; white-space: pre-line;">${escapeHtml(q.question)}</p>
        ${codeHtml}
        <div class="quiz-options-grid">
          ${optionsHtml}
        </div>
        ${feedbackHtml}
      </div>
    `;

    // Attach click events to options
    const optionBtns = quizContainer.querySelectorAll('.quiz-option-btn');
    optionBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        if (userAnswers.has(q.id)) return; // already answered
        const optIdx = parseInt(btn.getAttribute('data-opt'), 10);
        const isCorrect = q.options[optIdx].isCorrect;

        userAnswers.set(q.id, { selectedIndex: optIdx, isCorrect });
        renderCurrentQuestion();
        updateQuizHeader();
      });
    });

    updateQuizHeader();
  }

  // Navigation Listeners
  if (btnPrevQuestion) {
    btnPrevQuestion.addEventListener('click', () => {
      if (currentIndex > 0) {
        currentIndex--;
        renderCurrentQuestion();
      }
    });
  }

  if (btnNextQuestion) {
    btnNextQuestion.addEventListener('click', () => {
      if (currentIndex < questions.length - 1) {
        currentIndex++;
        renderCurrentQuestion();
      } else {
        showFinalSummary();
      }
    });
  }

  if (btnRestartQuiz) {
    btnRestartQuiz.addEventListener('click', () => {
      userAnswers.clear();
      currentIndex = 0;
      renderCurrentQuestion();
      updateQuizHeader();
    });
  }

  function showFinalSummary() {
    const total = questions.length;
    let correct = 0;
    userAnswers.forEach(ans => { if (ans.isCorrect) correct++; });
    const score = Math.round((correct / total) * 100);

    quizContainer.innerHTML = `
      <div class="quiz-question-card" style="text-align: center; padding: 2.5rem 1.5rem;">
        <div style="font-size: 3rem; margin-bottom: 0.5rem;">🏆</div>
        <h2 style="font-size: 1.6rem; margin: 0 0 0.5rem; color: #1e293b;">Kuis Praktikum GvRng Selesai!</h2>
        <p style="color: var(--color-text-muted); font-size: 1.05rem;">Skor Akhir Anda:</p>
        <div style="font-family: var(--display); font-size: 3.5rem; font-weight: 800; color: #0066cc; margin: 0.5rem 0;">
          ${score}<span style="font-size: 1.5rem; color: #64748b;"> / 100</span>
        </div>
        <p style="font-size: 0.95rem; color: #475569; margin-bottom: 1.5rem;">
          Anda menjawab benar <strong>${correct}</strong> dari total <strong>${total}</strong> soal.
        </p>
        <button id="btnReviewAll" class="btn-ctrl btn-primary" style="margin-right: 0.5rem;">Review Soal Pertama</button>
        <button id="btnResetQuizSummary" class="btn-ctrl btn-outline">Ulangi Kuis</button>
      </div>
    `;

    document.getElementById('btnReviewAll').addEventListener('click', () => {
      currentIndex = 0;
      renderCurrentQuestion();
    });

    document.getElementById('btnResetQuizSummary').addEventListener('click', () => {
      userAnswers.clear();
      currentIndex = 0;
      renderCurrentQuestion();
      updateQuizHeader();
    });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Initialize Quiz
  renderCurrentQuestion();
  updateQuizHeader();
});

